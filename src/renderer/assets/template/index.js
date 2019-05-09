token.registComponent("app",{
    methods:{
        onLabelClick(){
            $native.alert('You click here!');
        }
    },
    data(){
        return {
            title:"Hello, Welcome to Tokenhybrid!"
        }
    }
});

// 更多生命周期方法，请见文档
token.appLife({
    onLoad(data){
        // 程序渲染完毕
    },
    willShow(data){
        //用户界面即将显示
    }
})