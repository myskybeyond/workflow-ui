<template>
  <u-comment-scroll :disable="disable" @more="more">
    <u-comment :config="config" page @submit="submit" @mention-search="mentionSearchFn" @reply-page="replyPage"> </u-comment>
  </u-comment-scroll>
</template>

<script setup lang="ts">

import emoji from "@/assets/emoji/emoji";
import { reactive, ref } from "vue";
import { CommentApi, ConfigApi, ReplyApi, ReplyPageParamApi, SubmitParamApi, UToast } from "undraw-ui";
// 相对时间
import {dayjs} from '@/plugins/day';
import { isArray, isObject } from 'undraw-ui'
import { getUserProfile, selectAll } from "@/api/system/user";
import defAva from "@/assets/images/profile.jpg";
import { listCommentInfo, listReplyInfo ,addCommentInfo} from "@/api/business/comment";
import { UserVO } from "@/api/system/user/types";
//项目id信息
//提及用户列表
const mentionList = ref([]);
// 是否禁用滚动加载评论
const disable = ref(false);
//评论总数
const commentTotal = ref(0);

const props = defineProps({
   obj: {
    type: Object as PropType<{ projectId: string, orderId: string }>,
     required: true
  }
})

onMounted(() => {
  //获取用户个人信息
  getUser();
  //获取所有的用户信息
  getAllUsers();
  //查询评论分页信息
  // getCommentPage();
});


watch(()=> props.obj , () => {
  getCommentPage();
}, { deep: true })


/** 评论相关------------------ **/
const config = reactive<ConfigApi>({
  user: {
    id: 0,
    username: '',
    avatar: '',
    homeLink: ''
  } as any,
  emoji: emoji,
  comments: [],
  showLevel: false,
  showHomeLink: false,
  showAddress: false,
  showLikes: false,
  showReply:true,
  replyShowSize:3,
  mention: {
    data: mentionList.value,
    alias:{
      id: 'userId',
      username: 'userName',
      avatar: 'userAvatar',
    },
    showAvatar:true,
    showMention:true,
  }
})
//转换评论
function convertComment(comments: any, callback: (v: CommentApi) => void) {
  if (isArray(comments)) {
    comments.forEach((t: any) => {
      convertComment(t, callback)
    })
    return comments
  } else if (isObject(comments)) {
    if (comments.reply) {
      let replys = comments.reply.list
      if (replys && replys.length > 0) {
        convertComment(replys, callback)
      }
    }
    callback(comments)
    return comments
  }
}
function commentCall(v: CommentApi) {
  v.createTime = dayjs(v.createTime).fromNow()
}

// 评论提交事件
let temp_id = 100
// 提交评论事件
const submit = ({ content, parentId, files, reply , finish ,mentionList }: SubmitParamApi) => {
  let type = 0;
  if(props.obj.orderId != null){
    type = 1;
  }
  let obj =  {
    projectId :props.obj.projectId,
    orderId:props.obj.orderId,
    type:type,
    parentId:parentId,
    content:content,
    mentionList :[]
  }
  let arr = [];
  if(mentionList){
    for ( let i = 0 ; i < mentionList.length ;i++){
      arr.push(mentionList[i]);
    }
    obj.mentionList = arr;
  }
  addCommentInfo(obj).finally(() => {
      const comment: CommentApi = {
        id: String((temp_id += 1)),
        parentId: parentId,
        uid: config.user.id,
        content: content,
        createTime: new Date().toString(),
        user: {
          username: config.user.username,
          avatar: config.user.avatar
        },
        reply: null
      }
      setTimeout(() => {
        finish(convertComment(comment, v => commentCall(v)))
        UToast({ message: '评论成功!', type: 'info' })
      }, 200)

    }
  );
}
//获取当前用户信息
const getUser = async () => {
  const res = await getUserProfile();
  config.user.id = res.data.user.userId;
  config.user.username = res.data.user.nickName;
  if(!res.data.user.avatar ){
    config.user.avatar =  defAva;
  }else {
    config.user.avatar =  res.data.user.avatar;
  }
};

//评论查询params
const queryComParams = ref({
  pageNum: 1,
  pageSize: 5,
  projectId: props.obj.projectId,
  orderId:props.obj.orderId
})
const getCommentPage  = () => {
  queryComParams.value.projectId = props.obj.projectId;
  queryComParams.value.orderId = props.obj.orderId;
  nextTick(() => {
    //查询列表数据
    listCommentInfo(queryComParams.value).then(res => {
      commentTotal.value = res.total;
      //组织数据 放入用户信息
      if (res.total > 0 && res.rows) {
        let arr = [];
        for (let i = 0; i < res.rows.length; i++) {
          let cRes = convertToCommentApi(res.rows[i]);
          arr.push(cRes);
        }
        queryComParams.value.pageNum++;
        config.comments = convertComment(arr, v => commentCall(v))
      }
    })
  })
}

//转换数据结构为
const convertToCommentApi = ( CommentInfoVo:any) =>{
  let comment: CommentApi = {
    id: CommentInfoVo.id,
    parentId: CommentInfoVo.parentId,
    uid: CommentInfoVo.createBy,
    content: CommentInfoVo.content,
    createTime: CommentInfoVo.createTime,
    user: {
      username: getUserName(CommentInfoVo.createBy),
      avatar:getUserAvatar(CommentInfoVo.createBy),
      homeLink:'',
    },
    reply: null
  }


  let reply : ReplyApi={
    total: CommentInfoVo.replyNum ,
    list: []
  }
  if(CommentInfoVo.reply && CommentInfoVo.reply.records ) {
    //分页信息存在
    let replyList = [];
    for ( let i = 0 ; i < CommentInfoVo.reply.records.length ;i++){
      let replyO =  {
        id: CommentInfoVo.reply.records[i].id,
        parentId:CommentInfoVo.reply.records[i].parentId,
        uid: CommentInfoVo.reply.records[i].createBy,
        content:CommentInfoVo.reply.records[i].content,
        createTime: CommentInfoVo.reply.records[i].createTime,
        user: {
          username: getUserName(CommentInfoVo.reply.records[i].createBy),
          avatar:getUserAvatar(CommentInfoVo.reply.records[i].createBy),
          homeLink:''
        },
        reply: null
      }
      replyList.push(replyO);
    }
    reply.list = replyList;
  }
  //赋值comment
  comment.reply = reply;
  return comment;
}

//转换数据结构为
const convertToReplyApi = ( CommentInfoVo:any) =>{
  let comment: CommentApi = {
    id: CommentInfoVo.id,
    parentId: CommentInfoVo.parentId,
    uid: CommentInfoVo.createBy,
    content: CommentInfoVo.content,
    createTime: CommentInfoVo.createTime,
    user: {
      username: getUserName(CommentInfoVo.createBy),
      avatar:getUserAvatar(CommentInfoVo.createBy),
      homeLink:''
    },
    reply: null
  }
  return comment;
}
//获取所有的用户信息
const userList = ref<UserVO[]>([]);
//获取所有用户信息
const getUserName = (id: number) => {
  let actions: any[] = [];
  let datas = userList.value;
  Object.keys(datas).some((key) => {
    if (datas[key].userId == ('' +id)) {
      actions.push(datas[key].nickName);
      return true;
    }
  })
  return actions.join('');
}
//获取所有的用户信息
const getAllUsers = async () => {
  let res =  await selectAll();
  userList.value = res.data;
  if( userList.value){
    for(let i =0 ;i< userList.value.length; i++){
      let avt = userList.value[i].avatar ;
      if(!userList.value[i].avatar ){
        avt = defAva;
      }
      let mention = {
        userId: userList.value[i].userId,
        userName: userList.value[i].nickName,
        userAvatar: avt
      }
      mentionList.value.push(mention);
    }
  }
}
//获取用户列表
const getUserAvatar = (id: number) => {
  let actions: any[] = [];
  let datas = userList.value;
  Object.keys(datas).some((key) => {
    if (datas[key].userId == ('' +id)) {
      actions.push(datas[key].avatar);
      return true;
    }
  })
  if(actions.join('') == ""){
    return defAva;
  }else {
    return actions.join('');
  }

}
//提及搜索选项
const mentionSearchFn = (keyword: string) => {
  if (!keyword) {
    config.mention.data =mentionList.value;
    return
  }
  config.mention.data = mentionList.value.filter(e => {
    return e.userName.includes(keyword)
  })
}

//回复分页
const replyPage = ({ parentId, pageNum, pageSize, finish }: ReplyPageParamApi) => {
  let query ={
    pageSize:pageSize,
    pageNum:pageNum,
    parentId:parentId
  };
  listReplyInfo(query).then(res => {
    if(res.rows){
      //存在返回结果
      let reply : ReplyApi={
        total: res.total,
        list: []
      }
      let arr = [];
      for ( let i = 0 ; i < res.rows.length ;i++){
        let cRes = convertToReplyApi(res.rows[i]);
        arr.push(cRes);
      }
      reply.list = arr;
      finish(reply)
    }else{
      let reply : ReplyApi={
        total: 0,
        list: []
      }
      finish(reply)
    }
  })
}

// 加载更多评论
const more = () => {
  if (queryComParams.value.pageNum <= Math.ceil(commentTotal.value / queryComParams.value.pageSize)) {
    setTimeout(() => {
      listCommentInfo(queryComParams.value).then(res => {
        commentTotal.value = res.total;
        //组织数据 放入用户信息
        if(res.total > 0 && res.rows){
          let arr = [];
          for ( let i = 0 ; i < res.rows.length ;i++){
            let cRes = convertToCommentApi(res.rows[i]);
            arr.push(cRes);
          }
          //页数加1
          queryComParams.value.pageNum ++;
          config.comments.push(...convertComment(arr, v => commentCall(v)));
        }
      })
    }, 200)
  } else {
    disable.value = true
  }
}
</script>
