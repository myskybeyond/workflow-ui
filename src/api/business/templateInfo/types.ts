export interface TemplateInfoVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 模板名称
   */
  name: string;

  /**
   * 说明
   */
  description: string;

  /**
   * 类型;0:报价 1:下单
   */
  type: number;

  /**
   * 分类;固定、跟踪、电气、车棚
   */
  category: string;

  /**
   * 状态;0:正常 1:停用
   */
  status: number;

  /**
   * 在线文件id
   */
  onlineFileId: string | number;

  /**
   * 在线文件id
   */
  version: string | number;
}

export interface TemplateInfoForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 模板名称
   */
  name?: string;

  /**
   * 说明
   */
  description?: string;

  /**
   * 类型;0:报价 1:下单
   */
  type?: number;

  /**
   * 分类;固定、跟踪、电气、车棚
   */
  category?: string;

  /**
   * 状态;0:正常 1:停用
   */
  status?: number;

  /**
   * 在线文件id
   */
  onlineFileId?: string | number;

  /**
   * 版本
   */
  version?: string | number;
}

export interface TemplateInfoQuery extends PageQuery {
  /**
   * 模板名称
   */
  name?: string;

  /**
   * 分类;固定、跟踪、电气、车棚
   */
  category?: string;

  /**
   * 状态;0:正常 1:停用
   */
  status?: number;

  /**
   * 日期范围参数
   */
  params?: any;
  /**
   * 状态
   */
  type?: any;
}
