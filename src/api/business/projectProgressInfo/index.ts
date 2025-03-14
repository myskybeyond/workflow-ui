import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProjectProgressInfoVO, ProjectProgressInfoForm, ProjectProgressInfoQuery } from '@/api/business/projectProgressInfo/types';
import { ProjectDeliveryInfoForm } from "@/api/business/projectDeliveryInfo/types";

/**
 * 查询项目进度信息列表
 * @param query
 * @returns {*}
 */

export const listProjectProgressInfo = (query?: ProjectProgressInfoQuery): AxiosPromise<ProjectProgressInfoVO[]> => {
  return request({
    url: '/business/projectProgressInfo/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询项目进度信息详细
 * @param id
 */
export const getProjectProgressInfo = (id: string | number): AxiosPromise<ProjectProgressInfoVO> => {
  return request({
    url: '/business/projectProgressInfo/' + id,
    method: 'get'
  });
};

/**
 * 新增项目进度信息
 * @param data
 */
export const addProjectProgressInfo = (data: ProjectProgressInfoForm) => {
  return request({
    url: '/business/projectProgressInfo',
    method: 'post',
    data: data
  });
};

/**
 * 修改项目进度信息
 * @param data
 */
export const updateProjectProgressInfo = (data: ProjectProgressInfoForm) => {
  return request({
    url: '/business/projectProgressInfo',
    method: 'put',
    data: data
  });
};

/**
 * 删除项目进度信息
 * @param id
 */
export const delProjectProgressInfo = (id: string | number | Array<string | number>) => {
  return request({
    url: '/business/projectProgressInfo/' + id,
    method: 'delete'
  });
};
/**
 * 同步流程
 * @param data
 */
export const synProjectProgressInfo = (data: ProjectProgressInfoForm) => {
  return request({
    url: '/business/projectProgressInfo/sync',
    method: 'post',
    data: data
  });
};

/**
 * 查询所有的项目进度信息
 * @param query
 * @returns {*}
 */

export const listAllProjectProgressInfo = (query?: ProjectProgressInfoQuery): AxiosPromise<ProjectProgressInfoVO[]> => {
  return request({
    url: '/business/projectProgressInfo/list/all',
    method: 'get',
    params: query
  });
};

