import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { QuotationStatisticsVO, QuotationStatisticsForm, QuotationStatisticsQuery } from '@/api/business/quotationStatistics/types';

/**
 * 查询项目报价统计信息列表
 * @param query
 * @returns {*}
 */

export const listQuotationStatistics = (query?: QuotationStatisticsQuery): AxiosPromise<QuotationStatisticsVO[]> => {
  return request({
    url: '/business/quotationStatistics/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询项目报价统计信息详细
 * @param id
 */
export const getQuotationStatistics = (id: string | number): AxiosPromise<QuotationStatisticsVO> => {
  return request({
    url: '/business/quotationStatistics/' + id,
    method: 'get'
  });
};

/**
 * 新增项目报价统计信息
 * @param data
 */
export const addQuotationStatistics = (data: QuotationStatisticsForm) => {
  return request({
    url: '/business/quotationStatistics',
    method: 'post',
    data: data
  });
};

/**
 * 修改项目报价统计信息
 * @param data
 */
export const updateQuotationStatistics = (data: QuotationStatisticsForm) => {
  return request({
    url: '/business/quotationStatistics',
    method: 'put',
    data: data
  });
};

/**
 * 删除项目报价统计信息
 * @param id
 */
export const delQuotationStatistics = (id: string | number | Array<string | number>) => {
  return request({
    url: '/business/quotationStatistics/' + id,
    method: 'delete'
  });
};
