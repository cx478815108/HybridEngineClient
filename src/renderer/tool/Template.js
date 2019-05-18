export default class Template{
    
    getHTMLText(){
        const text = `
<div @bind = "app" class = "root">
    <label class = "title" @click = 'onLabelClick()'>{{title}}</label>    
</div>`
        return text.trim();
    }

    getCSSText(){
        const text = `
.root {
    display: flex;
    background-color: rgb(248, 248, 248);
    flex-direction: column;
}

.title {
    width: 100%;
    height: 60px;
    margin-top: 40px;
    font-size: 30px;
    text-align: center;
}`
        return text.trim();
    }

    getJSText(){
      const text = `
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
})`
        return text.trim();
    }
}