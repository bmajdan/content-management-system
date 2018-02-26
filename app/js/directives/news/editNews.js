function editNews($location, $compile, $window, $rootScope, NewsDatabase, TeachersDatabase, UploadFiles, WidgetsService, VisualSiteService) {
	'ngInject';

	return {
		restrict: 'E',
		templateUrl: 'directives/news/editNews.html',
		controller: 'EditNewsController',
		link: (scope) => {
			if (($location.path().split('/')[2]) == 'edytuj-post') {

				/* Open, Close, Edit elements etc. */

				let sendEditPost = (edit, published) => {
					console.log(edit);
					NewsDatabase.editPost(edit).then(newsData => {
						if (newsData.success) {
							if (published) {
								VisualSiteService.loadingScreen.stop();
								swal('Dobra robota!', newsData.message, 'success').then(() => {
									$window.location.reload();
								});
							} else {
								VisualSiteService.loadingScreen.stop();
								swal('Uwaga!', 'Trwa przenoszenie na stronę szkoły', 'warning').then(() => {
									$window.location.reload();
								});
							}
						} else {
							VisualSiteService.loadingScreen.stop();
							swal('Upss!', 'Coś poszło nie tak', 'error');
						}
					}, err => {
						VisualSiteService.loadingScreen.stop();
						swal('Upss!', err, 'error');
					});
				};

				document.querySelector('#addNewPostButton').style.display = 'none';

				scope.removeWidget = (type, ident) => {
					let arrayIndex = WidgetsService.removeWidget(type, ident, scope.editPost.widgets);
					scope.editPost.widgets.splice(arrayIndex, 1);
				};

				scope.addImageToPost = (element) => {
					WidgetsService.addImageToPost(element);
				};

				scope.changePostMiniature = () => {
					document.querySelector('#editPostMiniature').click();
				};

				document.querySelector('#editPostMiniature').onchange = function () {
					let vals = this.value,
						val = vals.length ? vals.split('\\').pop() : '';
					document.querySelector('#editPostMiniatureImage').value = val;
					let reader = new FileReader();
					reader.onload = function () {
						let dataURL = reader.result;
						let output = document.querySelector('#editPostMiniatureImage');
						output.src = dataURL;
					};
					reader.readAsDataURL(document.querySelector('#editPostMiniature').files[0]);
				};

				scope.openWidgetMenu = () => {
					angular.element(document.querySelector('#widget-manage')).append($compile('<post-widgets class="newWidget" object="editPost" addform=".editNewsForm"></post-widgets>')(scope));
				};

				/* ********************************************************* */

				/*Load news, define variable */
				VisualSiteService.loadingScreen.start();
				NewsDatabase.loadOnePost($location.path().split('/')[3]).then(data => {
					if (data.success && data.object.length > 0) {
						scope.news = data.object[0];
						scope.editArticleTitle = scope.news.postTitle;
						scope.editArticleShortText = scope.news.postShort;
						scope.editArticlePostText = scope.news.postText;
						scope.editArticleTags = scope.news.postTags;

						scope.editPost = {
							postTitle: scope.news.postTitle,
							postIdent: scope.news.postIdent,
							postData: scope.news.postData,
							postShort: scope.news.postShort,
							postMiniature: scope.news.postMiniature,
							postMiniatureSmall: scope.news.postMiniatureSmall,
							postTags: scope.news.postTags,
							postText: scope.news.postText,
							postAuthor: scope.news.postAuthor,
							postTeacher: scope.news.postTeacher,
							postPublished: scope.news.postPublished,
							widgets: scope.news.widgets
						};

						scope.miniatureUrl = `${scope.galleryUrl}/newsGallery/${scope.editPost.postMiniature}`;

						for (let value of scope.editPost.widgets) {
							if (value.type == 'image') {
								scope.addNewImage = value.id.split('_')[1];
								WidgetsService.insertImageBlock(scope, '.editNewsForm', 'newsGallery', value.image);
								scope.addNewImage++;
							} else if (value.type == 'text') {
								scope.addNewText = value.id.split('_')[1];
								scope.addTextColumn[scope.addNewText] = value.text;
								WidgetsService.insertInputBlock(scope, '.editNewsForm');
								scope.addNewText++;
							}
						}
						VisualSiteService.loadingScreen.stop();
					} else {
						VisualSiteService.loadingScreen.stop();
						scope.news = [];
						$location.path('/aktualnosci');
						return false;
					}
				}, err => {
					console.log(err);
					VisualSiteService.loadingScreen.stop();
					scope.news = [];
					$location.path('/aktualnosci');
					return false;
				});

				/* ********************************************************* */

				/* Manage Teachers */

				TeachersDatabase.loadAllTeachers().then(data => {
					if (data.success) {
						scope.teachers = data.object;
					}
				});

				scope.checkTeacher = (teacher) => {
					for (let value of scope.teachers) {
						if ((`${value.name} ${value.surname}`) == teacher) {
							return true;
						}
					}
					return false;
				};

				scope.editNews = published => {
					VisualSiteService.loadingScreen.start();
					let editPost = scope.editPost;
					let d = new Date();
					let day = ((d.getDate() < 10) ? `0${d.getDate()}` : d.getDate());
					let month = ((d.getMonth() + 1 < 10) ? `0${(d.getMonth() + 1)}` : (d.getMonth() + 1));
					let hr = ((d.getHours() < 10) ? `0${d.getHours()}` : d.getHours());
					let min = ((d.getMinutes() < 10) ? `0${d.getMinutes()}` : d.getMinutes());
					let sec = ((d.getSeconds() < 10) ? `0${d.getSeconds()}` : d.getSeconds());

					let postD = `${day}/${month}/${d.getFullYear()} ${hr}:${min}:${sec}`;
					editPost.postData = postD;

					if (document.querySelector('#editPostMiniature').files[0] != undefined) {
						editPost.postMiniature = `${editPost.postIdent}/${document.querySelector('#editPostMiniature').files[0].name}`;
						editPost.postMiniatureSmall = `${editPost.postIdent}/min_${document.querySelector('#editPostMiniature').files[0].name}`;
					}

					if (editPost.postTitle.length >= 1 && editPost.postTitle.length <= 80 &&
						editPost.postShort.length >= 1 && editPost.postShort.length <= 300 &&
						editPost.postText.length > 5 && editPost.postMiniature != undefined &&
						editPost.postTags.length >= 1 && scope.checkTeacher(editPost.postTeacher)) {

						editPost.postAuthor = $rootScope.userData.userName;
						editPost.postPublished = published;
						for (let value of editPost.widgets) {
							switch (value.type) {
								case 'text':
									value.text = scope.addTextColumn[value.id.split('_')[1]];
									break;
								case 'image':
									if (document.querySelector(`#addImageInput_${value.id.split('_')[1]}`).files[0] != undefined) {
										value.image = `${editPost.postIdent}/widgets/${document.querySelector(`#addImageInput_${value.id.split('_')[1]}`).files[0].name}`;
										let imageFolder = `./gallery/newsGallery/${editPost.postIdent}/widgets`,
											type = 'fullImage';
										UploadFiles.uploadImage(document.querySelector(`#addImageInput_${value.id.split('_')[1]}`).files[0], imageFolder, type).then(function () { });
									}
									break;
							}
						}

						if (document.querySelector('#editPostMiniature').files[0] != undefined) {
							let imageFolder = `./gallery/newsGallery/${editPost.postIdent}`;
							let type = 'miniature';
							UploadFiles.uploadImage(scope.editPostMiniature, imageFolder, type).then(() => {
								sendEditPost(editPost, published);
							}, err => {
								VisualSiteService.loadingScreen.stop();
								swal('Upss!', err, 'error');
							});
						} else {
							sendEditPost(editPost, published);
						}
					} else {
						VisualSiteService.loadingScreen.stop();
						swal('Uwaga!', 'Uzupełnij wszystkie wymagane pola!', 'warning');
					}
				};
			}
		}
	};
}

export default {
	name: 'editNews',
	fn: editNews
};
