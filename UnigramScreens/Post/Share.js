import React from 'react';
import { View, Text, Image, StyleSheet, TextInput, Button, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import ActionSheet from 'react-native-actionsheet'

const options = {
    title: 'Zdieľať',
    profileShareButton: 'Zdieľať na nástenke',
    chatShareButton: 'Poslať niekomu do chatu',
}

class Share extends React.Component {
    constructor(props) {
        super(props);
    }

    showActionSheet = () => {
        this.ActionSheet.show();
    };

    render() {
        var optionArray = [
            'Zdieľať na nástenke',
            'Poslať niekomu do chatu',
            'Zrušiť',
        ];
        return (
            <View>
                <ActionSheet
                    ref={o => (this.ActionSheet = o)}
                    options={optionArray}
                    cancelButtonIndex={optionArray.length - 1}
                    destructiveButtonIndex={optionArray.length - 1}
                    onPress={index => {
                        switch (index) {
                            case 0:
                                alert("0");
                                break;
                            case 1:
                                alert("1");
                                break;
                        }
                    }}
                />

                <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => this.showActionSheet()}>
                    <Icon name="share" color={'#212121'} size={25} style={{ marginLeft: 15 }} />
                </TouchableOpacity>

            </View>
        )
    }
}

export default Share
