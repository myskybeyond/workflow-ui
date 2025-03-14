import request from '@/utils/request'

// 查询流程列表
export function listProcess(query) {
  return request({
    url: '/workflow/process/list',
    method: 'get',
    params: query
  })
}

// 查询流程列表
export function getProcessForm(query) {
  return request({
    url: '/workflow/process/getProcessForm',
    method: 'get',
    params: query
  })
}

// 删除流程实例
export function delProcess(ids) {
  return request({
    url: '/workflow/process/instance/' + ids,
    method: 'delete'
  })
}

// 获取流程图
export function getBpmnXml(processDefId) {
  return request({
    url: '/workflow/process/bpmnXml/' + processDefId,
    method: 'get'
  })
}

export function detailProcess(query) {
  return request({
    url: '/workflow/process/detail',
    method: 'get',
    params: query
  })
}

// 我的发起的流程
export function listOwnProcess(query) {
  return request({
    url: '/workflow/process/ownList',
    method: 'get',
    params: query
  })
}

// 我待办的流程
export function listTodoProcess(query) {
  return request({
    url: '/workflow/process/todoList',
    method: 'get',
    params: query
  })
}

// 我待签的流程
export function listClaimProcess(query) {
  return request({
    url: '/workflow/process/claimList',
    method: 'get',
    params: query
  })
}

// 我已办的流程
export function listFinishedProcess(query) {
  return request({
    url: '/workflow/process/finishedList',
    method: 'get',
    params: query
  })
}

// 查询流程抄送列表
export function listCopyProcess(query) {
  return request({
    url: '/workflow/process/copyList',
    method: 'get',
    params: query
  })
}

// 取消申请
export function stopProcess(data) {
  return request({
    url: '/workflow/task/stopProcess',
    method: 'post',
    data: data
  })
}

// 部署流程实例
export function startProcessByDefKey(processDefKey, data) {
  return request({
    url: '/workflow/process/start?processDefKey=' + processDefKey,
    method: 'post',
    data: data
  })
}

// 我的发起的流程
export function listProcessInstances(query) {
  return request({
    url: '/workflow/process/instance/list',
    method: 'get',
    params: query
  })
}

// 修改任务状态
export function changeState(params) {
  return request({
    url: '/workflow/process/changeState',
    method: 'put',
    params: params
  });
}

// 可退回任务列表
export function jumpList(params) {
  return request({
    url: '/workflow/process/jumpList',
    method: 'get',
    params: params
  })
}

// 流程跳转
export function jumpProcess(data) {
  return request({
    url: '/workflow/process/submitJump',
    method: 'post',
    data: data
  })
}

// 任务列表
export function listTask(query) {
  return request({
    url: '/workflow/task/list',
    method: 'get',
    params: query
  })
}
