export interface ComponentInfoVO {
  /**
   * 所属分类
   */
  categoryId: string | number;

  /**
   * 父ID
   */
  parentId: string | number;

  /**
   * 品名
   */
  name: string;

  /**
   * 物料号
   */
  partNo: string;

  /**
   * 型号
   */
  type: string;

  /**
   * 图号
   */
  drgNo: string;

  /**
   * 材料
   */
  material: string;

  /**
   * 规格
   */
  spec: string;

  /**
   * 理论尺寸
   */
  theoreticalSize: string;

  /**
   * 物料尺寸
   */
  materialSize: string;

  /**
   * 数量
   */
  num: number;

  /**
   * 单位
   */
  unit: string;

  /**
   * 长度（mm）
   */
  length: number;

  /**
   * 米重(kg/m）
   */
  meterWeight: number;

  /**
   * 单重(kg)
   */
  weight: number;

  /**
   * 模具编号
   */
  mouldNo: string;

  /**
   * 开条尺寸
   */
  stripSize: string;

  /**
   * 卷宽
   */
  seamWidth: string | number;

  /**
   * 备注
   */
  remark: string;

  /**
   * 说明
   */
  description: string;

  /**
   * 成品完工物料号
   */
  finishPartNo: string;

  /**
   * 黑件完工物料号
   */
  blackPartNo: string;

  /**
   * 外协完工物料号
   */
  outPartNo: string;

  /**
   * 生产工艺
   */
  manufactureProcess: string;

  /**
   * 状态
   */
  status: number;

  /**
   * 排序
   */
  sort: number;

    /**
     * 子对象
     */
    children: ComponentInfoVO[];
}

export interface ComponentInfoForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 分类
   */
  category?: string;

  /**
   * 所属分类
   */
  categoryId?: string | number;

  /**
   * 父ID
   */
  parentId?: string | number;

  /**
   * 品名
   */
  name?: string;

  /**
   * 物料号
   */
  partNo?: string;

  /**
   * 型号
   */
  type?: string;

  /**
   * 图号
   */
  drgNo?: string;

  /**
   * 材料
   */
  material?: string;

  /**
   * 规格
   */
  spec?: string;

  /**
   * 理论尺寸
   */
  theoreticalSize?: string;

  /**
   * 物料尺寸
   */
  materialSize?: string;

  /**
   * 数量
   */
  num?: number;

  /**
   * 单位
   */
  unit?: string;

  /**
   * 长度（mm）
   */
  length?: number;

  /**
   * 米重(kg/m）
   */
  meterWeight?: number;

  /**
   * 单重(kg)
   */
  weight?: number;

  /**
   * 模具编号
   */
  mouldNo?: string;

  /**
   * 开条尺寸
   */
  stripSize?: string;

  /**
   * 卷宽
   */
  seamWidth?: string | number;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 说明
   */
  description?: string;

  /**
   * 成品完工物料号
   */
  finishPartNo?: string;

  /**
   * 黑件完工物料号
   */
  blackPartNo?: string;

  /**
   * 外协完工物料号
   */
  outPartNo?: string;

  /**
   * 生产工艺
   */
  manufactureProcess?: string;

  /**
   * 状态
   */
  status?: number;

  /**
   * 排序
   */
  sort?: number;

  /**
   * 文件
   */
  tenantId?: string | number;


  /**
   * 文件
   */
  relaFileInfo?: string ;

}

export interface ComponentInfoQuery {

  /**
   * 分类
   */
  category?: string;

  /**
   * 所属分类
   */
  categoryId?: string | number;

  /**
   * 父ID
   */
  parentId?: string | number;

  /**
   * 品名
   */
  name?: string;

  /**
   * 物料号
   */
  partNo?: string;

  /**
   * 型号   */
  type?: string;

  /**
   * 图号
   */
  drgNo?: string;

  /**
   * 材料
   */
  material?: string;

  /**
   * 规格
   */
  spec?: string;

  /**
   * 理论尺寸
   */
  theoreticalSize?: string;

  /**
   * 物料尺寸
   */
  materialSize?: string;

  /**
   * 数量
   */
  num?: number;

  /**
   * 单位
   */
  unit?: string;

  /**
   * 长度（mm）
   */
  length?: number;

  /**
   * 米重(kg/m）
   */
  meterWeight?: number;

  /**
   * 单重(kg)
   */
  weight?: number;

  /**
   * 模具编号
   */
  mouldNo?: string;

  /**
   * 开条尺寸
   */
  stripSize?: string;

  /**
   * 卷宽
   */
  seamWidth?: string | number;

  /**
   * 说明
   */
  description?: string;

  /**
   * 成品完工物料号
   */
  finishPartNo?: string;

  /**
   * 黑件完工物料号
   */
  blackPartNo?: string;

  /**
   * 外协完工物料号
   */
  outPartNo?: string;

  /**
   * 生产工艺
   */
  manufactureProcess?: string;

  /**
   * 状态
   */
  status?: number;

  /**
   * 排序
   */
  sort?: number;

    /**
     * 日期范围参数
     */
    params?: any;
}



