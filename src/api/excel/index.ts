import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 查询文件修改记录 保存发布历史列表
 * @param query
 * @returns {*}
 */
export const getEditHistory = (query: any): AxiosPromise => {
  return request({
    url: '/excel/getEditHistory',
    method: 'get',
    params: query
  });
};
/**
 * 删除文件的指定版本
 * @param query
 * @returns {*}
 */
export const delFileByVer = (query: any): AxiosPromise => {
  return request({
    url: '/excel/del',
    method: 'get',
    params: query
  });
};
/**
 * 查询修改版本单元格修改记录
 * @param query
 * @returns {*}
 */
export const getEditHistoryInfo = (query: any): AxiosPromise => {
  return request({
    url: '/excel/getEditHistoryInfo',
    method: 'get',
    params: query
  });
};
/**
 * 查询修改版本记录到行
 * @param query
 * @returns {*}
 */
export const getEditHistoryInfoByRow = (query: any): AxiosPromise => {
  return request({
    url: '/excel/getEditHistory/info',
    method: 'get',
    params: query
  });
};
/**
 * 修改文件
 * @param query
 * @returns {*}
 */
export const editFileInfo = (data: any): AxiosPromise => {
  return request({
    url: '/excel/editFileInfo',
    method: 'post',
    data: data
  });
};

/**
 * 查询临时文件
 * @param query
 * @returns {*}
 */
export const getFileCache = (query: any): AxiosPromise => {
  return request({
    url: '/excel/getCache',
    method: 'get',
    params: query
  });
};
/**
 * 查询文件
 * @param query
 * @returns {*}
 */
export const getFileInfo = (query: any): AxiosPromise => {
  return request({
    url: '/excel/getFile',
    method: 'get',
    params: query
  });
};
/**
 * 清理文件缓存
 * @param query
 * @returns {*}
 */
export const cancelSave = (query: any): AxiosPromise => {
  return request({
    url: '/excel/cancelSave',
    method: 'get',
    params: query
  });
};
/**
 * 新增文件
 * @param data
 */
export const addNew = (data: any) => {
  return request({
    url: '/excel/newFile',
    method: 'post',
    data: data
  });
};

/**
 * 修改文件
 * @param data
 */
export const editFile = (data: any) => {
  return request({
    url: '/excel/editFile',
    method: 'post',
    data: data
  });
};
/**
 * 获取文件用户文件列表
 * @param query
 */
export const getUserFileList = (query: any) => {
  return request({
    url: '/excel/getUserFileList',
    method: 'get',
    params: query
  });
};
/**
 * 新建一个文件
 * @param query
 */
export const createFile = (data: any) => {
  return request({
    url: '/excel/createFile',
    method: 'post',
    data: data
  });
};
/**
 * 查询标准件列表
 * @param query
 */
export const getComponentInfoList = (query: any) => {
  return request({
    url: '/business/componentInfo/page',
    method: 'get',
    params: query
  });
};
/**
 * 查询标准件详情列表
 * @param query
 */
export const getComponentList = (ids: any) => {
  return request({
    url: '/business/componentInfo/ins/'+ids,
    method: 'get'
  });
};
