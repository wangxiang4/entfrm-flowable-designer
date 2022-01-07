/**
 * @program: entfrm-flowable-designer
 *
 * @description: 设计器API请求接口
 *
 * @author: entfrm开发团队-王翔
 *
 * @create: 2021-06-27
 **/
import globalConfig from '@/common/config/global'
import { requestDecorator } from '@utils'

// 创建模型
export function addModel (data) {
  return requestDecorator(globalConfig.axiosInstance({
    url: '/app/rest/models',
    method: 'post',
    data: data
  }))
}

// 编辑模型
export function editModel (modelId, data) {
  return requestDecorator(globalConfig.axiosInstance({
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
    },
    url: '/workflow/model/saveModel/' + modelId,
    method: 'post',
    data: data
  }))
}

// 部署模型
export function deployModel (query) {
  return requestDecorator(globalConfig.axiosInstance({
    url: '/workflow/model/deploy',
    method: 'post',
    params: query
  }))
}

// 活动扩展属性保存
export function activityExtensionPropertySave (data) {
  return requestDecorator(globalConfig.axiosInstance({
    url: '/workflow/extension/activityExtensionProperty/save',
    method: 'post',
    data: data
  }))
}

// 活动扩展属性数据保存
export function activityExtensionDataSave (data) {
  return requestDecorator(globalConfig.axiosInstance({
    url: '/workflow/extension/activityExtensionData/save',
    method: 'post',
    data: data
  }))
}
