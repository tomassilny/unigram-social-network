import React from 'react'
import { createStackNavigator } from 'react-navigation-stack'
import { createSwitchNavigator, createAppContainer, StackActions } from 'react-navigation'
import Auth from '../screens/auth'
import Dialogs from '../screens/main/dialogs'
import AppWrap from '../screens/appWrap'
import Settings from '../screens/main/settings/index'
import Chat from '../screens/main/chat/index'
import Contacts from '../screens/main/contacts/index'
import CreateDialog from '../screens/main/contacts/createDialog'
import GroupDetails from '../screens/main/chat/groupDetails'
import ContactDetails from '../screens/main/chat/contactDetails'

export default createAppContainer(createSwitchNavigator(
  {
    AppWrap,
    Auth: createStackNavigator({
      Auth: {
        screen: Auth,
        navigationOptions: {
          headerShown: false
        }
      }
    }),
    Main: createStackNavigator({
      Dialogs: {
        screen: Dialogs
      },
      Settings: {
        screen: Settings,
        navigationOptions: {
          headerTitle: 'Nastavenia',
        }
      },
      Chat: {
        screen: Chat,
      },
      Contacts: {
        screen: Contacts,
        navigationOptions: {
          headerTitle: 'Kontakty'
        }
      },
      CreateDialog: {
        screen: CreateDialog,
        navigationOptions: {
          headerTitle: 'Nová skupina'
        }
      },
      GroupDetails: {
        screen: GroupDetails,
        navigationOptions: {
          headerTitle: 'Detaily skupiny'
        }
      },
      ContactDetails: {
        screen: ContactDetails,
        navigationOptions: {
          headerTitle: 'Detaily kontaktov'
        }
      }
    }),
  },
  {
    initialRouteName: 'AppWrap',
  }
))

export const popToTop = StackActions.popToTop()
