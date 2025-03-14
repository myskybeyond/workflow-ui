export interface ProjectInfoVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 项目编号
   */
  projectNo: string;

  /**
   * 类型;1：一般项目 2:重要项目 3:关键项目
   */
  type: string;

  /**
   * 项目名称
   */
  name: string;

  /**
   * DC总容量(MWp)
   */
  dc: string;

  /**
   * 客户类型;1：总包 2:开发 3:投资 4:同行 5:其它
   */
  customerType: string;

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
   * 支架类型;1：固定 2: 跟踪 3:车棚 4：固定+跟踪 5:固定+车棚 6:跟踪+车棚 7:固定+跟踪+车棚 8:其它
   */
  supportType: string;

  /**
   * 开始日期
   */
  startTime: string;

  /**
   * 预计结束日期
   */
  endTime: string;

  /**
   * 项目负责人
   */
  manager: number;

  /**
   * 项目内容描述
   */
  description: string;

  /**
   * 状态;0:待执行 1:执行中 2:已完成
   */
  status: number;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 更新时间
   */
  updateTime: string;
}

export interface ProjectInfoForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 项目编号
   */
  projectNo?: string;

  /**
   * 类型;1：一般项目 2:重要项目 3:关键项目
   */
  type?: string;

  /**
   * 项目名称
   */
  name?: string;

  /**
   * DC总容量(MWp)
   */
  dc?: string;

  /**
   * 客户类型;1：总包 2:开发 3:投资 4:同行 5:其它
   */
  customerType?: string;

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
   * 支架类型;1：固定 2: 跟踪 3:车棚 4：固定+跟踪 5:固定+车棚 6:跟踪+车棚 7:固定+跟踪+车棚 8:其它
   */
  supportType?: string;

  /**
   * 开始日期
   */
  startTime?: string;

  /**
   * 预计结束日期
   */
  endTime?: string;

  /**
   * 项目负责人
   */
  manager?: number;

  /**
   * 项目内容描述
   */
  description?: string;

  /**
   * 状态;0:待执行 1:执行中 2:已完成
   */
  status?: number;
}

export interface ProjectInfoQuery extends PageQuery {
  /**
   * 项目编号
   */
  projectNo?: string;

  /**
   * 类型;1：一般项目 2:重要项目 3:关键项目
   */
  type?: string;

  /**
   * 项目名称
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
   * 创建时间
   */
  createTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  /**
   * 状态;0:待执行 1:执行中 2:已完成
   */
  status?: number;
}
