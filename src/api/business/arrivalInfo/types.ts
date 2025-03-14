export interface ArrivalInfoVO {
  /**
   * 项目编号
   */
  proNo: string;

  /**
   * 项目名称
   */
  proName: string;

  /**
   * 供应商
   */
  supplier: string;

  /**
   * 存储地点
   */
  stoLocation: string;

  /**
   * 料号
   */
  partNo: string;

  /**
   * 品名
   */
  pName: string;

  /**
   * 规格
   */
  spec: string;

  /**
   * 材质
   */
  material: string;

  /**
   * 长度
   */
  length: string;

  /**
   * 库管员
   */
  stoKeeper: string;

  /**
   * 收货部门
   */
  receiveDepartment: string;

  /**
   * 到货时间
   */
  arriveTime: string;

  /**
   * 入库时间
   */
  receiveTime: string;

  /**
   * 实到数量
   */
  rtNum: string;

  /**
   * 点收数量
   */
  pcNum: string;

  /**
   * 实收数量
   */
  nrNum: string;

  /**
   * 退补数量
   */
  rsNum: string;
  /**
   * 采购单位名称
   */
  unitName: string;
  /**
   * 收货单号
   */
  receiveNo: string;
  /**
   * 业务日期
   */
  busiDate: string;
}

export interface ArrivalQuery extends PageQuery {
  /**
   * 组织编码
   */
  OrgCode?: string;

  /**
   * 项目编号
   */
  ProNo?: string;

  /**
   * 项目名称
   */
  ProName?: string;

  /**
   * 供应商
   */
  Supplier?: string;

  /**
   * 料号
   */
  PartNo?: string;

  /**
   * 规格
   */
  Spec?: string;

  /**
   * 材质
   */
  Material?: string;

  /**
   * 开始时间
   */
  StartTime?: string;

  /**
   * 结束时间
   */
  EndTime?: string;
  /**
   * 日期范围参数
   */
  params?: any;
}
