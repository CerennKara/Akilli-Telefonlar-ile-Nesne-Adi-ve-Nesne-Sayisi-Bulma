import React,{Component} from 'react';
import {StyleSheet,Image,View,Text,FlatList,Dimensions,Button} from 'react-native';
import {createAppContainer} from 'react-navigation';
import {createMaterialBottomTabNavigator} from 'react-navigation-material-bottom-tabs';
import {Icon} from 'react-native-elements';
import firestore from '@react-native-firebase/firestore';
import Photo from './Photo';
import {Root } from 'native-base';
const width = Dimensions.get('window').width;
class Home extends Component{
    constructor(props){
        super(props);
        this.state={
            fileList: []
        }
    }
    useEffect = () =>{
        this.setState({fileList:[]})
        const fetchPosts = async () => {
            try{
                firestore()
                .collection('Images')
                .get()
                .then((querySnapShot) => {
                    querySnapShot.forEach(doc => {
                        const{image,json,objectNumber} =doc.data();
                        let newDataImg=this.state.fileList;
                        let item={
                            url: image,
                            objectNumber: objectNumber,
                            json: json
                        }
                        newDataImg.push(item);
                        this.setState({fileList:newDataImg})
                    })
                });
            }catch(e){
                console.log(e);
            }
        }
        fetchPosts();
    };
    renderItem=({item,index})=>{
        return(
            <View style ={styles.itemViewImage}>
                <Text style={{fontSize:20}} >{item.objectNumber} </Text>
                <Image source={{uri:item.url}} style={styles.itemImage}/>
            </View>
        )
    };
    render()
    {   
        let {content} = styles;
        let{fileList} = this.state;
        return(
            <Root>
            <View style={content}>
                <Text style={{fontSize:40}}>Home Screen</Text> 
                <FlatList
                    data={fileList}
                    renderItem={this.renderItem}
                    keyExtractor={(item,index) => index.toString()}
                    extraData={this.state}
                />
                <Button title="Refresh" style={styles.btnPressStyle} onPress={() => this.useEffect()}> </Button>
            </View>
            </Root>
        );
    }
}
const styles=StyleSheet.create({
    content:{
        flex: 1,
        alignItems: 'center', 
        marginTop: 50,
        paddingLeft: 30,
        paddingRight: 30,
        marginBottom: 30
    },
    itemImage: {
        backgroundColor: '#2F455C',
        height: 150,
        width: width-60,
        borderRadius: 8,
        resizeMode: 'contain'
    },
    itemViewImage:{
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
    },
    btnPressStyle: {
        backgroundColor: '#0080ff',
        height: 50,
        width: width-60,
        alignItems: 'center',
        justifyContent: 'center'
    }
});
const TabNavigator=createMaterialBottomTabNavigator(
{
    Home :{screen:Home,
        navigationOptions:{
            tabBarLabel: 'Home',
            activeColor: '#ff0000',
            inactiveColor: '#000000',
            barStyle: {backgroundColor: '#67baf6'},
            tabBarIcon:()=>(
                <View>
                    <Icon name={'home'} size={25} style={{color: '#ff0000'}}/>
                    </View>   
            )
        }
    
    },
    Photo :{screen:Photo,
        navigationOptions:{
            tabBarLabel: 'Photo',
            activeColor: '#ff0000',
            inactiveColor: '#000000',
            barStyle: {backgroundColor: '#67baf6'},
            tabBarIcon:()=>(
                <View>
                    <Icon name={'camera'} size={25} style={{color: '#ff0000'}}/>
                    </View>   
            )
        }
    
    }
}

);
export default createAppContainer(TabNavigator);