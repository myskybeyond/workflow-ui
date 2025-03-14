export interface ProjectFileInfoVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 项目ID
   */
  projectId: string | number;

  /**
   * 订单ID
   */
  orderId: string | number;

  /**
   * 文件分类ID
   */
  categoryId: string | number;

  /**
   * 文件名称
   */
  name: string;

  /**
   * 下载地址
   */
  downloadUrl: string;

  /**
   * 是否在线;0:否 1:是
   */
  isOnline: number;

  /**
   * ACT_RU_VARIABLE表主键
   */
  actRuVariableId: string | number;

  /**
   * 流程实例ID
   */
  procInstId: string | number;

  /**
   * 参数执行ID
   */
  executionId: string | number;

  /**
   * 任务ID
   */
  taskId: string | number;

  /**
   * 资源ID
   */
  bytearrayId: string | number;

  /**
   * 说明
   */
  description: string;

  /**
   * 在线文件id
   */
  onlineFileId: string | number;

  version: string;

}

export interface ProjectFileInfoForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 项目ID
   */
  projectId?: string | number;

  /**
   * 订单ID
   */
  orderId?: string | number;

  /**
   * 文件分类ID
   */
  categoryId?: string | number;

  /**
   * 文件名称
   */
  name?: string;

  /**
   * 下载地址
   */
  downloadUrl?: string;

  /**
   * 是否在线;0:否 1:是
   */
  isOnline?: number;

  /**
   * ACT_RU_VARIABLE表主键
   */
  actRuVariableId?: string | number;

  /**
   * 流程实例ID
   */
  procInstId?: string | number;

  /**
   * 参数执行ID
   */
  executionId?: string | number;

  /**
   * 任务ID
   */
  taskId?: string | number;

  /**
   * 资源ID
   */
  bytearrayId?: string | number;

  /**
   * 说明
   */
  description?: string;

  /**
   * 在线文件id
   */
  onlineFileId?: string | number;

}

export interface ProjectFileInfoQuery extends PageQuery {

  /**
   * 项目ID
   */
  projectId?: string | number;

  /**
   * 订单ID
   */
  orderId?: string | number;

  /**
   * 文件分类ID
   */
  categoryId?: string | number;

  /**
   * 文件名称
   */
  name?: string;

  /**
   * 下载地址
   */
  downloadUrl?: string;

  /**
   * 是否在线;0:否 1:是
   */
  isOnline?: number;

  /**
   * ACT_RU_VARIABLE表主键
   */
  actRuVariableId?: string | number;

  /**
   * 流程实例ID
   */
  procInstId?: string | number;

  /**
   * 参数执行ID
   */
  executionId?: string | number;

  /**
   * 任务ID
   */
  taskId?: string | number;

  /**
   * 资源ID
   */
  bytearrayId?: string | number;

  /**
   * 说明
   */
  description?: string;

  /**
   * 在线文件id
   */
  onlineFileId?: string | number;

    /**
     * 日期范围参数
     */
    params?: any;

  updateBy?: string | number;
}



