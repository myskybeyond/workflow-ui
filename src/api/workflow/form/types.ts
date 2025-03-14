export interface FormVO {
  /**
   * 表单主键
   */
  formId: string | number;

  /**
   * 表单名称
   */
  formName: string;

  /**
   * 表单内容
   */
  content: string;

  /**
   * 备注
   */
  remark: string;
  /**
   * 流程分类
   */
  categoryCode?: string;
}

export interface FormForm extends BaseEntity {
  /**
   * 表单主键
   */
  formId?: string | number;

  /**
   * 表单名称
   */
  formName?: string;

  /**
   * 表单内容
   */
  content?: string;

  /**
   * 备注
   */
  remark?: string;
  /**
   * 流程分类
   */
  categoryCode?: string;
}

export interface FormQuery extends PageQuery {
  /**
   * 表单名称
   */
  formName?: string;

  /**
   * 表单内容
   */
  content?: string;

  /**
   * 日期范围参数
   */
  params?: any;
  /**
   * 流程分类
   */
  categoryCode?: string;
}

export interface DesignFormForm extends FormForm {
  rule?: string;

  option?: string;
}
