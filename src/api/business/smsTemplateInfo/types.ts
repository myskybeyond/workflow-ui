export interface SmsTemplateInfoVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 模板名称
   */
  name: string;

  /**
   * 模板编码
   */
  code: string;

  /**
   * 模板内容
   */
  content: string;

  /**
   * 状态;0:正常 1:停用
   */
  status: number;

  /**
   * 备注
   */
  remark: string;

}

export interface SmsTemplateInfoForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 模板名称
   */
  name?: string;

  /**
   * 模板编码
   */
  code?: string;

  /**
   * 模板内容
   */
  content?: string;

  /**
   * 状态;0:正常 1:停用
   */
  status?: number;

  /**
   * 备注
   */
  remark?: string;

}

export interface SmsTemplateInfoQuery extends PageQuery {

  /**
   * 模板名称
   */
  name?: string;

  /**
   * 模板编码
   */
  code?: string;

  /**
   * 模板内容
   */
  content?: string;

  /**
   * 状态;0:正常 1:停用
   */
  status?: number;

    /**
     * 日期范围参数
     */
    params?: any;
}



