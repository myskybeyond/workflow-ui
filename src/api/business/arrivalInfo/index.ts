import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ArrivalInfoVO, ArrivalQuery } from '@/api/business/arrivalInfo/types';

/**
 * 查询到货信息列表
 * @param query
 * @returns {*}
 */

export const listArrival = (query?: ArrivalQuery): AxiosPromise<ArrivalInfoVO[]> => {
  return request({
    url: '/business/arrival/list',
    method: 'get',
    params: query
  });
};
