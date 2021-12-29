/**
 * @program: entfrm-flowable-designer
 *
 * @description: 面板API请求接口
 *
 * @author: entfrm开发团队-王翔
 *
 * @create: 2021-06-03
*/
import globalConfig from '@/common/config/global'
import { requestDecorator } from '@utils'

// 查询角色列表
export function listRole (query) {
  return requestDecorator(globalConfig.axiosInstance({
    url: '/system/role/list',
    method: 'get',
    params: query
  }))
}

// 查询部门下拉树结构
export function deptTree () {
  return requestDecorator(globalConfig.axiosInstance({
    url: '/system/dept/deptTree',
    method: 'get'
  }))
}

// 查询用户列表
export function listUser (query) {
  return requestDecorator(globalConfig.axiosInstance({
    url: '/system/user/list',
    method: 'get',
    params: query
  }))
}

// 查询部门详细
export function getDept (deptId) {
  return requestDecorator(globalConfig.axiosInstance({
    url: '/system/dept/' + deptId,
    method: 'get'
  }))
}

// 查询表单管理列表
export function listForm (query) {
  return requestDecorator(globalConfig.axiosInstance({
    url: '/toolkit/form/list',
    method: 'get',
    params: query
  }))
}

// 查询常用按钮列表
export function listButton (query) {
  return requestDecorator(globalConfig.axiosInstance({
    url: '/flowable/extension/button/list',
    method: 'get',
    params: query
  }))
}

// 查询多个用户详细
export function getUserByIds (ids) {
  return requestDecorator(globalConfig.axiosInstance({
    url: '/system/user/getByIds/' + ids,
    method: 'get'
  }))
}

// 查询多个角色详细
export function getRoleByIds (ids) {
  return requestDecorator(globalConfig.axiosInstance({
    url: '/system/role/getByIds/' + ids,
    method: 'get'
  }))
}

// 查询流程表达式列表
export function listCondition (query) {
  return requestDecorator(globalConfig.axiosInstance({
    url: '/flowable/extension/condition/list',
    method: 'get',
    params: query
  }))
}

// 查询监听器列表
export function listListener (query) {
  return requestDecorator(globalConfig.axiosInstance({
    url: '/flowable/extension/listener/list',
    method: 'get',
    params: query
  }))
}
