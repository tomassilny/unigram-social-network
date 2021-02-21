import React from 'react'
import { Router, Scene, Actions } from 'react-native-router-flux'
import AsyncStorage from '@react-native-community/async-storage'
import Register from './UnigramScreens/RegisterScreen.js'
import Login from './UnigramScreens/LoginScreen.js'
import Main from './UnigramScreens/MainScreen.js'
import Profile from './UnigramScreens/Profile/Profile'
import EditProfile from './UnigramScreens/Profile/EditProfile.js'
import ChangePassword from './UnigramScreens/Profile/ChangePassword.js'
import { Settings } from 'react-native'
import Search from './UnigramScreens/Search/Search.js'
import OnePost from './UnigramScreens/Post/OnePost.js'
import ChatWindow from './UnigramScreens/Chat/ChatWindow.js'
import CreateGroup from './UnigramScreens/Chat/CreateGroup.js'

function logout() {
   AsyncStorage.removeItem("@id");
   Actions.login();
}

const Routes = () => (
   <Router>
      <Scene key="root">
         <Scene key="main" component={Main} title="Unigram" hideNavBar={true} initial={true} />
         <Scene key="register" component={Register} title="Register" hideNavBar={true} />
         <Scene key="login" component={Login} title="Login" hideNavBar={true} />
         <Scene key="profile" component={Profile} onRight={() => logout()} title="Profil" rightTitle={"Logout"}/>
         <Scene key="edit_profile" component={EditProfile} title="Edit profile" />
         <Scene key="change_password" component={ChangePassword} title="Change password" />
         <Scene key="settings" component={Settings} title="Settings and informations" />
         <Scene key="chatwindow" component={ChatWindow} title="Chat" hideNavBar={false} rightTitle={"Profile"}/>
         <Scene key="search" component={Search} title="Search" hideNavBar={true}/>
         <Scene key="post" component={OnePost} title="Post" hideNavBar={false}/>
         <Scene key="creategroup" component={CreateGroup} title="Group" hideNavBar={false}/>
      </Scene>
   </Router>
)
export default Routes
