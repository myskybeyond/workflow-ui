import request from '@/utils/request';

// 绑定账号
export function authBinding(source: string) {
  return request({
    url: '/auth/binding/' + source,
    method: 'get'
  });
}

// 解绑账号
export function authUnlock(authId: string) {
  return request({
    url: '/auth/unlock/' + authId,
    method: 'delete'
  });
}

//获取授权列表
export function getAuthList() {
  return request({
    url: '/system/social/list',
    method: 'get'
  });
}

export function listAuthList(query: any) {
  return request({
    url: '/system/social/page',
    method: 'get',
    params: query
  });
}

export function generateState() {
  return request({
    url: '/auth/state',
    method: 'get'
  });
}

export function appUserList(appType?: string, appCode?: string) {
  return request({
    url: '/system/social/list/' + appType + '/' + appCode,
    method: 'get'
  });
}
