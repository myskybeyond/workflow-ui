<template>
  <div class="component-upload-image">
    <el-upload
      multiple
      :action="uploadImgUrl"
      list-type="picture-card"
      :on-success="handleUploadSuccess"
      :before-upload="handleBeforeUpload"
      :limit="limit"
      :on-error="handleUploadError"
      :on-exceed="handleExceed"
      ref="imageUpload"
      :before-remove="handleDelete"
      :show-file-list="true"
      :headers="headers"
      :file-list="fileList"
      :on-preview="handlePictureCardPreview"
      :class="{ hide: fileList.length >= limit }"
      :disabled="disabled"
    >
      <el-icon class="avatar-uploader-icon">
        <plus />
      </el-icon>
    </el-upload>
    <!-- 上传提示 -->
    <div class="el-upload__tip" v-if="showTip">
      请上传
      <template v-if="fileSize">
        大小不超过 <b style="color: #f56c6c">{{ fileSize }}MB</b>
      </template>
      <template v-if="fileType">
        格式为 <b style="color: #f56c6c">{{ fileType.join("/") }}</b>
      </template>
      的文件
    </div>

    <el-dialog v-model="dialogVisible" title="预览" width="800px" append-to-body>
      <img :src="dialogImageUrl" style="display: block; max-width: 100%; margin: 0 auto" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { listByIds, delOss } from "@/api/system/oss";
import { ComponentInternalInstance } from "vue";
import { OssVO } from "@/api/system/oss/types";
import { propTypes } from '@/utils/propTypes';
import {globalHeaders} from "@/utils/request";

const props = defineProps({
    modelValue: [String, Object, Array],
    // 图片数量限制
    limit: propTypes.number.def(5),
    // 大小限制(MB)
    fileSize: propTypes.number.def(5),
    // 文件类型, 例如['png', 'jpg', 'jpeg']
    fileType: propTypes.array.def(["png", "jpg", "jpeg"]),
    // 是否显示提示
    isShowTip: {
        type: Boolean,
        default: true
    },
    disabled:{
     type: Boolean,
     default: false
   },
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const emit = defineEmits(['update:modelValue']);
const number = ref(0);
const uploadList = ref<any[]>([]);
const dialogImageUrl = ref("");
const dialogVisible = ref(false);

const baseUrl = import.meta.env.VITE_APP_BASE_API;
const uploadImgUrl = ref(baseUrl + "/resource/oss/upload"); // 上传的图片服务器地址
const headers = ref(globalHeaders());

const fileList = ref<any[]>([]);
const showTip = computed(
    () => props.isShowTip && (props.fileType || props.fileSize)
);

const imageUploadRef = ref<ElUploadInstance>();

watch(() => props.modelValue, async val => {
    if (val) {
        // 首先将值转为数组
        let list: OssVO[] = [];
        if (Array.isArray(val)) {
            list = val as OssVO[];
        } else {
            const res = await listByIds(val as string)
            list = res.data
        }
        // 然后将数组转为对象数组
        fileList.value = list.map(item => {
            // 字符串回显处理 如果此处存的是url可直接回显 如果存的是id需要调用接口查出来
            let itemData;
            if (typeof item === "string") {
                itemData = { name: item, url: item };
            } else {
                // 此处name使用ossId 防止删除出现重名
                itemData = { name: item.ossId, url: item.url, ossId: item.ossId };
            }
            return itemData;
        });
    } else {
        fileList.value = [];
        return [];
    }
}, { deep: true, immediate: true });

/** 上传前loading加载 */
const handleBeforeUpload = (file: any) => {
    let isImg = false;
    if (props.fileType.length) {
        let fileExtension = "";
        if (file.name.lastIndexOf(".") > -1) {
            fileExtension = file.name.slice(file.name.lastIndexOf(".") + 1);
        }
        isImg = props.fileType.some((type: any) => {
            if (file.type.indexOf(type) > -1) return true;
            if (fileExtension && fileExtension.indexOf(type) > -1) return true;
            return false;
        });
    } else {
        isImg = file.type.indexOf("image") > -1;
    }
    if (!isImg) {
        proxy?.$modal.msgError(
            `文件格式不正确, 请上传${props.fileType.join("/")}图片格式文件!`
        );
        return false;
    }
    if (props.fileSize) {
        const isLt = file.size / 1024 / 1024 < props.fileSize;
        if (!isLt) {
            proxy?.$modal.msgError(`上传头像图片大小不能超过 ${props.fileSize} MB!`);
            return false;
        }
    }
    proxy?.$modal.loading("正在上传图片，请稍候...");
    number.value++;
}

// 文件个数超出
const handleExceed = () => {
    proxy?.$modal.msgError(`上传文件数量不能超过 ${props.limit} 个!`);
}

// 上传成功回调
const handleUploadSuccess = (res: any, file: UploadFile) => {
    if (res.code === 200) {
        uploadList.value.push({ name: res.data.fileName, url: res.data.url, ossId: res.data.ossId });
        uploadedSuccessfully();
    } else {
        number.value--;
        proxy?.$modal.closeLoading();
        proxy?.$modal.msgError(res.msg);
        imageUploadRef.value?.handleRemove(file);
        uploadedSuccessfully();
    }
}

// 删除图片
const handleDelete = (file: UploadFile): boolean => {
    const findex = fileList.value.map(f => f.name).indexOf(file.name);
    if (findex > -1 && uploadList.value.length === number.value) {
        let ossId = fileList.value[findex].ossId;
        delOss(ossId);
        fileList.value.splice(findex, 1);
        emit("update:modelValue", listToString(fileList.value));
        return false;
    }
    return true;
}

// 上传结束处理
const uploadedSuccessfully = () => {
    if (number.value > 0 && uploadList.value.length === number.value) {
        fileList.value = fileList.value.filter(f => f.url !== undefined).concat(uploadList.value);
        uploadList.value = [];
        number.value = 0;
        emit("update:modelValue", listToString(fileList.value));
        proxy?.$modal.closeLoading();
    }
}

// 上传失败
const handleUploadError = () => {
    proxy?.$modal.msgError("上传图片失败");
    proxy?.$modal.closeLoading();
}

// 预览
const handlePictureCardPreview = (file: any) => {
    dialogImageUrl.value = file.url;
    dialogVisible.value = true;
}

// 对象转成指定字符串分隔
const listToString = (list: any[], separator?: string) => {
    let strs = "";
    separator = separator || ",";
    for (let i in list) {
        if (undefined !== list[i].ossId && list[i].url.indexOf("blob:") !== 0) {
            strs += list[i].ossId + separator;
        }
    }
    return strs != "" ? strs.substring(0, strs.length - 1) : "";
}
</script>

<style scoped lang="scss">
// .el-upload--picture-card 控制加号部分
:deep(.hide .el-upload--picture-card) {
    display: none;
}
</style>
