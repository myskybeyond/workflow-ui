import request from '@/utils/request';
import {AxiosPromise} from 'axios';
import {VerifyCodeResult} from "@/api/types";


/**
 * 获取流程列表
 */
export function getWfList(): AxiosPromise<VerifyCodeResult> {
  return request({
    url: '/system/user/getWfList',
    method: 'get',
  });
}

/**
 * 添加一个流程
 */
export function setWf(data: any): AxiosPromise<VerifyCodeResult> {
  return request({
    url: '/system/user/addWf',
    method: 'post',
    data
  });
}

/**
 * 删除一个流程
 */
export function delWf(data: any): AxiosPromise<VerifyCodeResult> {
  return request({
    url: '/system/user/delWf',
    method: 'post',
    data
  });
}

/**
 * 获取项目列表
 */
export function projectList(): AxiosPromise<VerifyCodeResult> {
  return request({
    url: '/business/projectAuthority/myProject',
    method: 'get'
  });
}


/**
 * 获取 下单进度跟踪 列表
 */
export function getOrderFlwReationList(param: any): AxiosPromise<VerifyCodeResult> {
  return request({
    url: '/system/orderFlwRelation/list',
    method: 'get',
    params: param
  });
}


/**
 * 获取 报价进度跟踪 列表
 */
export function getprojectFlwRelationList(param: any): AxiosPromise<VerifyCodeResult> {
  return request({
    url: '/system/projectFlwRelation/tracking',
    method: 'get',
    params: param
  });
}
/**
 * 获取 领导工作台数据
 */
export function getIndexNumbers(): AxiosPromise<VerifyCodeResult> {
  return request({
    url: '/business/orderInfo/indexInfo',
    method: 'get',
  });
}

/**
 * @param data {LoginData}
 * @returns
 */
/*export function login(data: LoginData): AxiosPromise<LoginResult> {
  const params = {
    ...data,
    grantType: data.grantType || 'password'
  };
  return request({
    url: '/auth/login',
    headers: {
      isToken: false,
      isEncrypt: true
    },
    method: 'post',
    data: params
  });
}

// 注册方法
export function register(data: any) {
  const params = {
    ...data,
    grantType: 'password'
  };
  return request({
    url: '/auth/register',
    headers: {
      isToken: false,
      isEncrypt: true
    },
    method: 'post',
    data: params
  });
}

/!**
 * 注销
 *!/
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  });
}



/!**
 * 第三方登录
 *!/
export function callback(data: LoginData): AxiosPromise<any> {
  const LoginData = {
    ...data,
    grantType: 'social'
  };
  return request({
    url: '/auth/social/callback',
    method: 'post',
    data: LoginData
  });
}

// 获取用户详细信息
export function getInfo(): AxiosPromise<UserInfo> {
  return request({
    url: '/system/user/getInfo',
    method: 'get'
  });
}

// 获取租户列表
export function getTenantList(): AxiosPromise<TenantInfo> {
  return request({
    url: '/auth/tenant/list',
    headers: {
      isToken: false
    },
    method: 'get'
  });
}

// 获取app列表
export function getAppList(): AxiosPromise<TenantInfo> {
  return request({
    url: '/auth/app/list',
    headers: {
      isToken: false
    },
    method: 'get'
  });
}

export function getInfoByAuthCode(authCode: any) {
  return request({
    url: '/dingtalk/auth',
    method: 'get'
  });
}

/!**
 * 第三方扫码授权后的回调(用户绑定)
 *!/
export function callbackBind(data: LoginData): AxiosPromise<any> {
  const LoginData = {
    ...data,
    grantType: 'social'
  };
  return request({
    url: '/auth/social/callback/bind',
    method: 'post',
    data: LoginData
  });
}*/
