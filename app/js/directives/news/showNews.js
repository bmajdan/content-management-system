function showNews($location, $filter, NewsDatabase) {
	'ngInject';
	
	return {
		restrict: 'E',
		templateUrl: 'directives/news/showNews.html',
		link: (scope) => {

			document.getElementById('addNewPostButton').style.display = 'block';

			if(($location.path().split('/')[2]) === undefined){
				NewsDatabase.loadAllNews().then(function(data){
					if(data.loadNewsStatus == true){
						scope.newsData = data.loadNewsData;
						for(let i = 0; i < scope.newsData.length; i++){
							scope.newsData[i].display = true;
						}
					}else{
						scope.newsData = [];
					}
				});
			}

			scope.editPost = (postIdent) => {
				$location.path('/aktualnosci/edytuj-post/' + postIdent);
				return false;
			};

			scope.removePost = (postIdent) => {
				NewsDatabase.deleteNews(postIdent).then(function(data){
					if(data.deleteNewsStatus){
						alert(data.deleteNewsMessage);
						let found = $filter('ArrayFilter')('postIdent', postIdent, scope.newsData);
						scope.newsData.splice(found, 1);
					}
				});
			};
		}
	};
}

export default {
	name: 'showNews',
	fn: showNews
};
