export interface SmsInfoVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 消息模板ID
   */
  smsTemplateId: string | number;

  /**
   * 模板名称
   */
  name: string;

  /**
   * 模板编码
   */
  code: string;

  /**
   * 项目ID
   */
  projectId: string | number;

  /**
   * 项目名称
   */
  projectName: string;

  /**
   * 销售订单ID
   */
  orderId: string | number;

  /**
   * 销售订单名称
   */
  orderName: string;

  /**
   * 流程定义ID;关联 act_re_procdef 主键
   */
  procId: string | number;

  /**
   * 流程定义名称
   */
  procName: string;

  /**
   * 来源
   */
  source: string;

  /**
   * 来源用户ID
   */
  sourceUserId: string | number;

  /**
   * 用户ID
   */
  userId: string | number;

  /**
   * 消息内容
   */
  content: string;

  /**
   * 是否已读;0:未读 1:已读
   */
  isRead: number;

  /**
   * 参数
   */
  params: string;

  /**
   * 模板内容
   */
  templateContent: string;
}

export interface SmsInfoForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 消息模板ID
   */
  smsTemplateId?: string | number;

  /**
   * 模板名称
   */
  name?: string;

  /**
   * 模板编码
   */
  code?: string;

  /**
   * 项目ID
   */
  projectId?: string | number;

  /**
   * 项目名称
   */
  projectName?: string;

  /**
   * 销售订单ID
   */
  orderId?: string | number;

  /**
   * 销售订单名称
   */
  orderName?: string;

  /**
   * 流程定义ID;关联 act_re_procdef 主键
   */
  procId?: string | number;

  /**
   * 流程定义名称
   */
  procName?: string;

  /**
   * 来源
   */
  source?: string;

  /**
   * 来源用户ID
   */
  sourceUserId?: string | number;

  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 消息内容
   */
  content?: string;

  /**
   * 是否已读;0:未读 1:已读
   */
  isRead?: number;

  /**
   * 参数
   */
  smsParams?: string;

  /**
   * 模板内容
   */
  templateContent?: string;
  procNodeName?: string;
}

export interface SmsInfoQuery extends PageQuery {
  /**
   * 消息模板ID
   */
  smsTemplateId?: string | number;

  /**
   * 模板名称
   */
  name?: string;

  /**
   * 模板编码
   */
  code?: string;

  /**
   * 项目ID
   */
  projectId?: string | number;

  /**
   * 项目名称
   */
  projectName?: string;

  /**
   * 销售订单ID
   */
  orderId?: string | number;

  /**
   * 销售订单名称
   */
  orderName?: string;

  /**
   * 流程定义ID;关联 act_re_procdef 主键
   */
  procId?: string | number;

  /**
   * 流程定义名称
   */
  procName?: string;

  /**
   * 来源
   */
  source?: string;

  /**
   * 来源用户ID
   */
  sourceUserId?: string | number;

  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 消息内容
   */
  content?: string;

  /**
   * 是否已读;0:未读 1:已读
   */
  isRead?: number;

  /**
   * 参数
   */
  // params?: string;

  /**
   * 模板内容
   */
  templateContent?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  procNodeName?: string;
}
