export interface QuotationStatisticsVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 项目ID
   */
  projectId: string | number;

  /**
   * 项目类型
   */
  projectType: string;

  /**
   * 部门ID
   */
  deptId: string | number;

  /**
   * 发起业务员
   */
  salesman: number;

  /**
   * 设计员
   */
  designer: number;

  /**
   * 校对人
   */
  proofreader: number;

  /**
   * 审核人
   */
  auditer: number;

  /**
   * 接收日期
   */
  receivedDate: string;

  /**
   * 预计完成时间
   */
  expectedDate: string;

  /**
   * 实际完成时间
   */
  actualDate: string;

  /**
   * 统计日期;固定、跟踪、电气、车棚
   */
  statisticsDate: string;

}

export interface QuotationStatisticsForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 项目ID
   */
  projectId?: string | number;

  /**
   * 项目类型
   */
  projectType?: string;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 发起业务员
   */
  salesman?: number;

  /**
   * 设计员
   */
  designer?: number;

  /**
   * 校对人
   */
  proofreader?: number;

  /**
   * 审核人
   */
  auditer?: number;

  /**
   * 接收日期
   */
  receivedDate?: string;

  /**
   * 预计完成时间
   */
  expectedDate?: string;

  /**
   * 实际完成时间
   */
  actualDate?: string;

  /**
   * 统计日期;固定、跟踪、电气、车棚
   */
  statisticsDate?: string;

}

export interface QuotationStatisticsQuery extends PageQuery {

  /**
   * 项目ID
   */
  projectId?: string | number;

  /**
   * 项目类型
   */
  projectType?: string;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 统计日期;固定、跟踪、电气、车棚
   */
  statisticsDate?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



