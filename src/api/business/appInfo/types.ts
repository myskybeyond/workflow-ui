export interface AppInfoVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 应用名称
   */
  name: string;

  /**
   * 应用类型
   */
  appType: string;

  /**
   * 客户端编号
   */
  appKey: string;

  /**
   * 客户端密钥
   */
  appSecret: string;

  /**
   * AGENT_ID
   */
  agentId: string | number;

  /**
   * 状态;0:正常 1:停用
   */
  status: number;

  appCode: string;
  sort: number;
}

export interface AppInfoForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 应用名称
   */
  name?: string;

  /**
   * 应用类型
   */
  appType?: string;

  /**
   * 客户端编号
   */
  appKey?: string;

  /**
   * 客户端密钥
   */
  appSecret?: string;

  /**
   * AGENT_ID
   */
  agentId?: string | number;

  /**
   * 状态;0:正常 1:停用
   */
  status?: number;

  appCode?: string;
  sort?: number;
}

export interface AppInfoQuery extends PageQuery {
  /**
   * 应用名称
   */
  name?: string;

  /**
   * 应用类型
   */
  appType?: string;

  /**
   * 客户端编号
   */
  appKey?: string;

  /**
   * 客户端密钥
   */
  appSecret?: string;

  /**
   * AGENT_ID
   */
  agentId?: string | number;

  /**
   * 状态;0:正常 1:停用
   */
  status?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
