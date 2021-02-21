import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import PropTypes from 'prop-types';
import { Actions } from 'react-native-router-flux';

class Follow extends React.Component {
    constructor(props) {
        super(props);
    }

    goToProfile = () => {
        this.props.handleCloseModal();
        Actions.profile({ userID: this.props.user.user_id });
    }

    render() {
        return (
            <View style={{ paddingLeft: 15, paddingRight: 15, marginTop: 18 }}>
                <TouchableOpacity onPress={this.goToProfile} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image style={styles.avatar} source={require('./../../../images/avatar.png')} width={40} height={40} />
                    <Text style={{ fontWeight: 'bold', marginLeft: 10 }}>{this.props.user.firstname} {this.props.user.surname}</Text>
                </TouchableOpacity>
                <View style={{ flex: 1, marginTop: 10, height: 1, backgroundColor: '#f1f1f1' }}></View>
            </View>
        )
    }
}
Follow.propTypes = {
    user: PropTypes.object.isRequired
};

export default Follow

const styles = StyleSheet.create({
    avatar: {
        width: 30,
        height: 30,
        backgroundColor: '#ddd',
        borderRadius: 50,
        borderColor: '#000',
        borderWidth: 1,
    },
});