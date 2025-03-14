export interface ProjectProgressStatisticsVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 项目ID
   */
  projectId: string | number;

  /**
   * 订单ID
   */
  orderId: string | number;

  /**
   * 关联进度ID
   */
  projectProgressId: string | number;

  /**
   * 到货进度
   */
  arrival: string;

  /**
   * 生产进度
   */
  production: string;

  /**
   * 镀锌进度 黑件
   */
  black: string;

  /**
   * 镀锌进度 白件
   */
  white: string;

  /**
   * 发货进度
   */
  delivery: string;

  /**
   * 下单日期
   */
  orderDate: string;

  /**
   * 发货开始时间
   */
  deliverStartDate: string;

  /**
   * 发货结束时间
   */
  deliverEndDate: string;

  /**
   * 统计日期;固定、跟踪、电气、车棚
   */
  statisticsDate: string;

}

export interface ProjectProgressStatisticsForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 项目ID
   */
  projectId?: string | number;

  /**
   * 订单ID
   */
  orderId?: string | number;

  /**
   * 关联进度ID
   */
  projectProgressId?: string | number;

  /**
   * 到货进度
   */
  arrival?: string;

  /**
   * 生产进度
   */
  production?: string;

  /**
   * 镀锌进度 黑件
   */
  black?: string;

  /**
   * 镀锌进度 白件
   */
  white?: string;

  /**
   * 发货进度
   */
  delivery?: string;

  /**
   * 下单日期
   */
  orderDate?: string;

  /**
   * 发货开始时间
   */
  deliverStartDate?: string;

  /**
   * 发货结束时间
   */
  deliverEndDate?: string;

  /**
   * 统计日期;固定、跟踪、电气、车棚
   */
  statisticsDate?: string;

}

export interface ProjectProgressStatisticsQuery extends PageQuery {

  /**
   * 项目ID
   */
  projectId?: string | number;

  /**
   * 订单ID
   */
  orderId?: string | number;

  /**
   * 关联进度ID
   */
  projectProgressId?: string | number;

  /**
   * 到货进度
   */
  arrival?: string;

  /**
   * 生产进度
   */
  production?: string;

  /**
   * 镀锌进度 黑件
   */
  black?: string;

  /**
   * 镀锌进度 白件
   */
  white?: string;

  /**
   * 发货进度
   */
  delivery?: string;

  /**
   * 下单日期
   */
  orderDate?: string;

  /**
   * 发货开始时间
   */
  deliverStartDate?: string;

  /**
   * 发货结束时间
   */
  deliverEndDate?: string;

  /**
   * 统计日期;固定、跟踪、电气、车棚
   */
  statisticsDate?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



