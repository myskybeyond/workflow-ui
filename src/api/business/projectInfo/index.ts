import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProjectInfoVO, ProjectInfoForm, ProjectInfoQuery } from '@/api/business/projectInfo/types';

/**
 * 查询项目信息列表
 * @param query
 * @returns {*}
 */

export const listProjectInfo = (query?: ProjectInfoQuery): AxiosPromise<ProjectInfoVO[]> => {
  return request({
    url: '/business/projectInfo/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询项目信息详细
 * @param id
 */
export const getProjectInfo = (id: string | number): AxiosPromise<ProjectInfoVO> => {
  return request({
    url: '/business/projectInfo/' + id,
    method: 'get'
  });
};

/**
 * 新增项目信息
 * @param data
 */
export const addProjectInfo = (data: ProjectInfoForm) => {
  return request({
    url: '/business/projectInfo',
    method: 'post',
    data: data
  });
};

/**
 * 修改项目信息
 * @param data
 */
export const updateProjectInfo = (data: ProjectInfoForm) => {
  return request({
    url: '/business/projectInfo',
    method: 'put',
    data: data
  });
};

/**
 * 删除项目信息
 * @param id
 */
export const delProjectInfo = (id: string | number | Array<string | number>) => {
  return request({
    url: '/business/projectInfo/' + id,
    method: 'delete'
  });
};


/**
 * 查询所有的项目信息列表
 * @param query
 * @returns {*}
 */

export const listProjectInfoAll = (query?: ProjectInfoQuery): AxiosPromise<ProjectInfoVO[]> => {
  return request({
    url: '/business/projectInfo/list/all',
    method: 'get',
    params: query
  });
};
/**
 * 查询项目信息列表
 * @param query
 * @returns {*}
 */

export const myProjectList = (query?: ProjectInfoQuery): AxiosPromise<ProjectInfoVO[]> => {
  return request({
    url: '/business/projectInfo/myProjectList',
    method: 'get',
    params: query
  });
};
