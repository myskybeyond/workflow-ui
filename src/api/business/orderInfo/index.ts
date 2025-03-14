import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { OrderInfoVO, OrderInfoForm, OrderInfoQuery } from '@/api/business/orderInfo/types';

/**
 * 查询销售订单信息列表
 * @param query
 * @returns {*}
 */

export const listOrderInfo = (query?: OrderInfoQuery): AxiosPromise<OrderInfoVO[]> => {
  return request({
    url: '/business/orderInfo/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询销售订单信息详细
 * @param id
 */
export const getOrderInfo = (id: string | number): AxiosPromise<OrderInfoVO> => {
  return request({
    url: '/business/orderInfo/' + id,
    method: 'get'
  });
};

/**
 * 新增销售订单信息
 * @param data
 */
export const addOrderInfo = (data: OrderInfoForm) => {
  return request({
    url: '/business/orderInfo',
    method: 'post',
    data: data
  });
};

/**
 * 修改销售订单信息
 * @param data
 */
export const updateOrderInfo = (data: OrderInfoForm) => {
  return request({
    url: '/business/orderInfo',
    method: 'put',
    data: data
  });
};

/**
 * 删除销售订单信息
 * @param id
 */
export const delOrderInfo = (id: string | number | Array<string | number>) => {
  return request({
    url: '/business/orderInfo/' + id,
    method: 'delete'
  });
};

/**
 * 查询销售订单信息列表
 * @param query
 * @returns {*}
 */

export const listAllOrderInfo = (query?: OrderInfoQuery): AxiosPromise<OrderInfoVO[]> => {
  return request({
    url: '/business/orderInfo/list/all',
    method: 'get',
    params: query
  });
};

/**
 * 修改销售订单进度信息
 * @param data
 */
export const updateProgress = (data: OrderInfoForm) => {
  return request({
    url: '/business/orderInfo/progress',
    method: 'put',
    data: data
  });
};

/**
 * 修改销售订单进度信息
 * @param query
 */
export const myOrderList = (query?: OrderInfoQuery): AxiosPromise<OrderInfoVO[]> => {
  return request({
    url: '/business/orderInfo/myOrderList',
    method: 'get',
    params: query
  });
};
