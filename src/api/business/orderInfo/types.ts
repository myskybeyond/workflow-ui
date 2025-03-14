export interface OrderInfoVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 项目id
   */
  projectId: string | number;

  /**
   * 销售订单编号
   */
  orderNo: string;

  /**
   * 销售订单名称
   */
  name: string;

  /**
   * 采购单位
   */
  purchaseUnit: string;

  /**
   * 业主单位
   */
  ownerUnit: string;

  /**
   * 项目地点
   */
  location: string;

  /**
   * 联系人
   */
  contactPerson: string;

  /**
   * 联系电话
   */
  contactPhone: string;

  /**
   * 邮箱
   */
  contactEmail: string;

  /**
   * 其它
   */
  other: string;

  /**
   * DC总容量(MWp)
   */
  dc: string;

  /**
   * 销售订单描述
   */
  description: string;

  /**
   * 支架类型;1：固定 2: 跟踪 3:车棚
   */
  supportType: string;

  /**
   * 状态;0:待执行 1:执行中 2:已完成
   */
  status: number;

  /**
   * 开始日期
   */
  startTime: string;

  /**
   * 预计结束日期
   */
  endTime: string;

  /**
   * 销售订单负责人
   */
  manager: number;

  /**
   * 进度
   */
  progress: string;

}

export interface OrderInfoForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 项目id
   */
  projectId?: string | number;

  /**
   * 销售订单编号
   */
  orderNo?: string;

  /**
   * 销售订单名称
   */
  name?: string;

  /**
   * 采购单位
   */
  purchaseUnit?: string;

  /**
   * 业主单位
   */
  ownerUnit?: string;

  /**
   * 项目地点
   */
  location?: string;

  /**
   * 联系人
   */
  contactPerson?: string;

  /**
   * 联系电话
   */
  contactPhone?: string;

  /**
   * 邮箱
   */
  contactEmail?: string;

  /**
   * 其它
   */
  other?: string;

  /**
   * DC总容量(MWp)
   */
  dc?: string;

  /**
   * 销售订单描述
   */
  description?: string;

  /**
   * 支架类型;1：固定 2: 跟踪 3:车棚
   */
  supportType?: string;

  /**
   * 状态;0:待执行 1:执行中 2:已完成
   */
  status?: number;

  /**
   * 开始日期
   */
  startTime?: string;

  /**
   * 预计结束日期
   */
  endTime?: string;

  /**
   * 销售订单负责人
   */
  manager?: number;

  /**
   * 进度
   */
  progress?: string;

}

export interface OrderInfoQuery extends PageQuery {

  /**
   * 项目id
   */
  projectId?: string | number;

  /**
   * 销售订单编号
   */
  orderNo?: string;

  /**
   * 销售订单名称
   */
  name?: string;

  /**
   * 创建时间
   */
  createTime?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



