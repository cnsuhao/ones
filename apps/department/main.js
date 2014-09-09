(function(){
    angular.module("ones.department", [])
        .config(["$routeProvider", function($routeProvider) {
            $routeProvider
                .when("/department/viewChild/authGroup/pid/:pid", {
                    templateUrl: appView('assignPermission.html', 'department'),
                    controller: 'AuthGroupAssignPermissionCtl'
                })
                .when("/department/Department/add/pid/:pid", {
                    templateUrl: 'common/base/views/edit.html',
                    controller: 'DepartmentEditCtl'
                })
                .when("/department/Department/edit/id/:id", {
                    templateUrl: 'common/base/views/edit.html',
                    controller: 'DepartmentEditCtl'
                })
                .when("/department/Logout", {
                    templateUrl: 'common/base/views/blank.html',
                    controller: 'LogoutCtl'
                })
                //个人资料
                .when('/department/Profile', {
                    templateUrl: appView('profile.html', 'department'),
                    controller: 'PassportProfileCtl'
                })
            ;
        }])
        .factory("UserProfileRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "department/profile.json", null, {'update': {method: 'PUT'}});
        }])

        .factory("DepartmentRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "department/department/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("AuthRuleRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "department/authRule/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("AuthGroupRes", ["$resource", "ones.config", function($resource, cnf) {
            return $resource(cnf.BSU + "department/authGroup/:id.json", null, {'update': {method: 'PUT'}});
        }])
        .factory("AuthGroupRuleRes", ["$resource", "ones.config", function($resource, cnf){
            return $resource(cnf.BSU + "department/authGroupRule/:id.json", null, {
                'update': {method: 'PUT'},
                'query' : {isArray: false}
            });
        }])

        .service("Department.UserAPI", ["$rootScope", "ones.dataApiFactory", "$q", "$http", "ones.config", function($rootScope, res, $q, $http, conf){
            this.structure = {
                id: {
                    primary: true
                },
                email: {
                    inputType: "email",
                    ensureunique: "UserRes"
                },
                username: {
                    ensureunique: "UserRes"
                },
                password: {
                    inputType: "password",
                    listable: false,
                    required: false
                },
                truename: {},
                phone: {
                    inputType: "number"
                },
                group_name: {
                    displayName: $rootScope.i18n.lang.usergroup,
                    field: "usergroup",
                    hideInForm: true
                },
                usergroup: {
                    inputType: "select",
                    multiple: "multiple",
                    nameField: "title",
                    valueField: "id",
                    listable: false,
                    dataSource: "AuthGroupRes"
                },
                department: {
                    field: "Department.name",
                    hideInForm: true,
                    dataSource: "DepartmentRes"
                },
                department_id: {
                    displayName: $rootScope.i18n.lang.department,
                    nameField: "prefix_name",
                    listable: false,
                    inputType: "select"
                },
                status: {
                    displayName: $rootScope.i18n.lang.isEnable,
                    inputType: "select",
                    dataSource: [
                        {id: 1, name: $rootScope.i18n.lang.yes},
                        {id: -1, name: $rootScope.i18n.lang.no}
                    ]
                }
            };

            this.api = res.getResourceInstance({
                uri: "department/user",
                extraMethod: {
                    "update": {method: "PUT"}
                }
            });

            this.loginAPI = res.getResourceInstance({
                uri: "passport/login"
            });

            this.getStructure = function() {
                return this.structure;
            };

            this.login = function(loginInfo) {
                var defer = $q.defer();

                this.loginAPI.save(loginInfo).$promise.then(function(data){
                    if(data.error) {
                        defer.reject(toLang(data.msg, "messages", $rootScope));
                    } else if(data.sessionHash){
                        defer.resolve(data.sessionHash);
                    }
                }, function(data){
                    defer.reject(toLang(data, "messages", $rootScope));
                });

//                $http.post(conf.BSU+'passport/userLogin', loginInfo).
//                    success(function(data, status, headers, config) {
//                        if(data.error) {
//                            defer.reject(toLang(data.msg, "messages", $rootScope));
//                        } else if(data.sessionHash){
//                            defer.resolve(data.sessionHash);
//                        }
//                    }).
//                    error(function(data, status, headers, config) {
//                        defer.reject(toLang(data, "messages", $rootScope));
//                    });
                return defer;
            };

            this.logout = function(){
                var defer = $q.defer();
                this.loginAPI.query().$promise.then(function(){
                    ones.caches.clear(-1);
                    ones.caches.clear(0);
                    window.location.href = "./";
                });
            };

        }])

        .factory("AuthRuleModel", ["$rootScope", function($rootScope){
            return {
                getStructure : function() {
                    return {
                        id: {primary: true},
                        name: {},
                        title: {
                            field: "name",
                            cellFilter: "toAuthNodeName"
                        },
                        category: {
                            inputType: "select",
                            dataSource: [
                                {id: "all", name: "公用模块"},
                                {id: "basedata", name: "基础数据"},
                                {id: "crm", name: "客户管理"},
                                {id: "finance", name: "基本财务模块"},
                                {id: "accounting", name: "高级财务模块"},
                                {id: "produce", name: "生产管理"},
                                {id: "sale", name: "销售模块"},
                                {id: "department", name: "组织机构管理"},
                                {id: "set", name: "设置模块"},
                                {id: "statistics", name: "统计模块"},
                                {id: "stock", name: "仓储模块"}
                            ]
                        }
                    };
                }
            };
        }])
        .factory("DepartmentModel", ["$rootScope", function($rootScope){
            return {
                subAble: true,
                viewSubAble: false,
                getStructure: function(){
                    var i18n = $rootScope.i18n.lang;
                    return {
                        id : {
                            primary: true
                        },
                        name: {
                            displayName: i18n.category,
                            listable: false
                        },
                        prefix_name: {
                            hideInForm: true,
                            displayName: i18n.category
                        }
                    };
                }
            };
        }])
        .factory("AuthGroupModel", ["$rootScope", function($rootScope){
            return {
                subAble: true,
                addSubAble: false,
                getStructure: function(){
                    var i18n = $rootScope.i18n.lang;
                    return {
                        id : {
                            primary: true
                        },
                        title: {
                            displayName: i18n.name
                        }
                    };
                }
            };
        }])

        .controller("LogoutCtl", ["$scope", "$http", "ones.config", "Department.UserAPI", function($scope, $http, conf, User){
             User.logout();
        }])
        .controller("AuthGroupAssignPermissionCtl", ["$scope", "AuthGroupRuleRes", "$routeParams", "$location", "ones.config",
            function($scope, AuthGroupRuleRes, $routeParams, $location, conf){
                $scope.permissionData = {};
                $scope.selectAble = false;
                $scope.dataList = [];
                AuthGroupRuleRes.query({id: $routeParams.pid}).$promise.then(function(data){
                    $scope.permissionData = data.selected || {};
                    $scope.dataList = data.rules || {};
                });

                $scope.toggleThisLine = function(evt) {
                    var tdContainer = $(evt.target).parents("td").next();
                    var node_id = tdContainer.find("input[type='checkbox']").eq(0).data("nodeid");
                    if($scope.permissionData[node_id]) {
                        $(tdContainer).find("input[type='checkbox']").each(function(){
                            $scope.permissionData[$(this).data("nodeid")] = undefined;
                            $(this).prop("checked", false);
                        });
                    } else {
                        $(tdContainer).find("input[type='checkbox']").each(function(){
                            $scope.permissionData[$(this).data("nodeid")] = true;
                            $(this).prop("checked", "checked");
                        });
                    }
                }


                $scope.doSubmit = function(){
                    AuthGroupRuleRes.update({id: $routeParams.pid}, {
                        nodes: $scope.permissionData
                    }).$promise.then(function(data){
                        $location.url("/department/list/authGroup");
                    });
                };
            }])

        .controller("PassportProfileCtl", ["$scope", "$modal", "Department.UserAPI", function($scope, $modal, User){

            var modal = $modal({
                scope: $scope,
                title: $scope.$parent.i18n.lang.widgetTitles.editMyProfile,
                contentTemplate: appView('profileEdit.html', 'department'),
                show: false
            });
            $scope.showProfileEdit = function(){
                $scope.userInfo = $scope.$parent.userInfo;
                modal.show();
            };

            $scope.doSubmitProfile = function() {
                $scope.$parent.userInfo = $scope.userInfo;
                User.api.update({id: $scope.userInfo.id, editMine: true}, {
                    phone: $scope.userInfo.phone,
                    username: $scope.userInfo.username,
                    truename: $scope.userInfo.truename,
                    password: $scope.userInfo.password,
                    email: $scope.userInfo.email
                }).$promise.then(function(data){
                    modal.hide();
                });
            };
        }])
    ;
})();