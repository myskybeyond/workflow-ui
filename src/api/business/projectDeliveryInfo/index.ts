import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProjectDeliveryInfoVO, ProjectDeliveryInfoForm, ProjectDeliveryInfoQuery } from '@/api/business/projectDeliveryInfo/types';

/**
 * 查询项目发货信息列表
 * @param query
 * @returns {*}
 */

export const listProjectDeliveryInfo = (query?: ProjectDeliveryInfoQuery): AxiosPromise<ProjectDeliveryInfoVO[]> => {
  return request({
    url: '/business/projectDeliveryInfo/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询项目发货信息详细
 * @param id
 */
export const getProjectDeliveryInfo = (id: string | number): AxiosPromise<ProjectDeliveryInfoVO> => {
  return request({
    url: '/business/projectDeliveryInfo/' + id,
    method: 'get'
  });
};

/**
 * 新增项目发货信息
 * @param data
 */
export const addProjectDeliveryInfo = (data: ProjectDeliveryInfoForm) => {
  return request({
    url: '/business/projectDeliveryInfo',
    method: 'post',
    data: data
  });
};

/**
 * 修改项目发货信息
 * @param data
 */
export const updateProjectDeliveryInfo = (data: ProjectDeliveryInfoForm) => {
  return request({
    url: '/business/projectDeliveryInfo',
    method: 'put',
    data: data
  });
};

/**
 * 删除项目发货信息
 * @param id
 */
export const delProjectDeliveryInfo = (id: string | number | Array<string | number>) => {
  return request({
    url: '/business/projectDeliveryInfo/' + id,
    method: 'delete'
  });
};
/**
 * 同步流程
 * @param data
 */
export const synProjectDeliveryInfo = (data: ProjectDeliveryInfoForm) => {
  return request({
    url: '/business/projectDeliveryInfo/sync',
    method: 'post',
    data: data
  });
};
