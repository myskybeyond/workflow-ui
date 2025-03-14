import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProjectProgressStatisticsVO, ProjectProgressStatisticsForm, ProjectProgressStatisticsQuery } from '@/api/business/projectProgressStatistics/types';

/**
 * 查询项目进度统计信息列表
 * @param query
 * @returns {*}
 */

export const listProjectProgressStatistics = (query?: ProjectProgressStatisticsQuery): AxiosPromise<ProjectProgressStatisticsVO[]> => {
  return request({
    url: '/business/projectProgressStatistics/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询项目进度统计信息详细
 * @param id
 */
export const getProjectProgressStatistics = (id: string | number): AxiosPromise<ProjectProgressStatisticsVO> => {
  return request({
    url: '/business/projectProgressStatistics/' + id,
    method: 'get'
  });
};

/**
 * 新增项目进度统计信息
 * @param data
 */
export const addProjectProgressStatistics = (data: ProjectProgressStatisticsForm) => {
  return request({
    url: '/business/projectProgressStatistics',
    method: 'post',
    data: data
  });
};

/**
 * 修改项目进度统计信息
 * @param data
 */
export const updateProjectProgressStatistics = (data: ProjectProgressStatisticsForm) => {
  return request({
    url: '/business/projectProgressStatistics',
    method: 'put',
    data: data
  });
};

/**
 * 删除项目进度统计信息
 * @param id
 */
export const delProjectProgressStatistics = (id: string | number | Array<string | number>) => {
  return request({
    url: '/business/projectProgressStatistics/' + id,
    method: 'delete'
  });
};
