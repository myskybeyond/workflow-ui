export interface InventoryVO {
  /**
   * 料号
   */
  partNo: string;

  /**
   * 品名
   */
  pname: string;
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
   * 库存单位名称
   */
  unitName: string;

  /**
   * 数量
   */
  num: string;

  /**
   * 其它项目库存可用量
   */
  otherNum: string;
}

export interface InventoryQuery extends PageQuery {
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
   * 品名
   */
  PName?: string;

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
}
