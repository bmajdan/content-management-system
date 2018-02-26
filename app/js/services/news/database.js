function NewsDatabase($http, $location, AppSettings, $rootScope) {
  'ngInject';

  const service = {};

  service.loadAllNews = () => {
    let url = `${AppSettings.apiUrl}load-all-news`;
    let succesCallback = (data) => { return data.data; };
    let errorCallback = (err) => { return err; };
    return $http.get(url).then(succesCallback, errorCallback);
  };

  service.loadOnePost = (postIdent) => {
    let url = `${AppSettings.apiUrl}load-one-post`;
    let succesCallback = (data) => { return data.data; };
    let errorCallback = (err) => { return err; };
    let params = { postIdent: postIdent };
    return $http.get(url, { params: params }).then(succesCallback, errorCallback);
  };

  service.deletePost = (postIdent) => {
    let url = `${AppSettings.apiUrl}delete-post`;
    let succesCallback = (data) => { return data.data; };
    let errorCallback = (err) => { return err; };
    let params = { postIdent: postIdent, 'token': $rootScope.userData.token };
    return $http.delete(url, { params: params }).then(succesCallback, errorCallback);
  };

  service.addPost = (postData) => {
    let url = `${AppSettings.apiUrl}add-post`;
    let succesCallback = (data) => { return data.data; };
    let errorCallback = (err) => { return err; };
    let data = JSON.stringify({ data: postData, 'token': $rootScope.userData.token});
    return $http.post(url, data).then(succesCallback, errorCallback);
  };

  service.editPost = (postData) => {
    let url = `${AppSettings.apiUrl}edit-post`;
    let succesCallback = (data) => { return data.data; };
    let errorCallback = (err) => { return err; };
    let data = JSON.stringify({ data: postData, 'token': $rootScope.userData.token});
    return $http.put(url, data).then(succesCallback, errorCallback);
  };
  return service;
}

export default {
  name: 'NewsDatabase',
  fn: NewsDatabase
};
