import request from '@/utils/request';
import {AxiosPromise} from 'axios';
import {LoginData, LoginResult, VerifyCodeResult, TenantInfo} from './types';
import {UserInfo} from '@/api/system/user/types';
import { AppInfoVO } from "@/api/business/appInfo/types";

// pc端固定客户端授权id
const clientId = import.meta.env.VITE_APP_CLIENT_ID;

/**
 * @param data {LoginData}
 * @returns
 */
export function login(data: LoginData): AxiosPromise<LoginResult> {
  const params = {
    ...data,
    clientId: data.clientId || clientId,
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
    clientId: clientId,
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

/**
 * 注销
 */
export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  });
}

/**
 * 获取验证码
 */
export function getCodeImg(): AxiosPromise<VerifyCodeResult> {
  return request({
    url: '/auth/code',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  });
}

/**
 * 第三方登录
 */
export function callback(data: LoginData): AxiosPromise<any> {
  const LoginData = {
    ...data,
    clientId: clientId,
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

// 获取用户详细信息
export function getAvatar(userId: number): AxiosPromise<UserInfo> {
  return request({
    url: '/system/user/userAvatar',
    method: 'get',
    params: {userId}
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
export function getAppList(): AxiosPromise<AppInfoVO[]> {
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

/**
 * 第三方扫码授权后的回调(用户绑定)
 */
export function callbackBind(data: LoginData): AxiosPromise<any> {
  const LoginData = {
    ...data,
    clientId: clientId,
    grantType: 'social'
  };
  return request({
    url: '/auth/social/callback/bind',
    method: 'post',
    data: LoginData
  });
}
