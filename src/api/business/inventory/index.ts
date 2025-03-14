import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { InventoryVO, InventoryQuery } from '@/api/business/inventory/types';

/**
 * 查询消库存信息列表
 * @param query
 * @returns {*}
 */

export const listInventory = (query?: InventoryQuery): AxiosPromise<InventoryVO[]> => {
  return request({
    url: '/business/inventory/list',
    method: 'get',
    params: query
  });
};

export const listOtherInventory = (query?: { PartNo: undefined }): AxiosPromise<[]> => {
  return request({
    url: '/business/inventory/others',
    method: 'get',
    params: query
  });
};

export const proListInventory = (query?: InventoryQuery): AxiosPromise<InventoryVO[]> => {
  return request({
    url: '/business/inventory/proList',
    method: 'get',
    params: query
  });
};
