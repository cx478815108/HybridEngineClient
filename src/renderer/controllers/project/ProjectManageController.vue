<template>
  <div id="projectController" ref = "projectContainer">
      <div id = "rootContainer">
        <Drawer title="新建工程" v-model="showCreateForm" :width="formWidth" :styles="formStyles">
          <CreateForm></CreateForm>
        </Drawer> 
        <nav class = "navigationBar">
            <div class = "navItem">
                <div id = "navTitle">工程管理</div>
            </div>
            <div class = "navItem">
                <Button type= 'text' @click = "onNewProjectClick()"><Icon type="ios-add-circle-outline" size = "20" /></Button>
                <Button type= 'text' @click = "deleteAllProjects()"><Icon type="ios-trash-outline"  size = "20" /></Button>
            </div>
        </nav>

        <div id = "cardContainer">
            <div class = "card" v-for = "item in cards" >
            <Card>
                <p slot="title">{{item.displayName}}</p>
                <p class = "cardText">唯一标识: {{item.identifier}}</p>
            </Card>
            <Button class = "runProj" type="default" 
            shape="circle" icon="ios-construct-outline" @click = 'onCardClick(item)'></Button>
            </div>
        </div>
      </div>
  </div>
</template>

<script>
  import CreateForm from "@/controllers/project/CreateForm";
  export default {
    name: 'engineclient',
    components:{
        'CreateForm':CreateForm,
    },
    updated(){
        this.formWidth = this.$refs.projectContainer.clientWidth-1;
    },
    data(){
        return {
            showCreateForm: false,
            formWidth:400,
            formStyles: {
                height: 'calc(100% - 55px)',
                overflow: 'auto',
                paddingBottom: '53px',
                position: 'static'
            },
            cards:[{
                displayName:'app',
                identifier: 'abc'

            }]
        }
    },
    methods:{
        onNewProjectClick(){
            this.showCreateForm = true;
        },
        deleteAllProjects(){

        },
        onCardClick(item){
            this.$router.push({
                name:'edit',
                params:{}
                });
        }
    }
  }
</script>

<style scoped>
  #projectController{
      width: 100%;
      height: 100%;
  }

  .navigationBar{
      width: 100%;
      height: 44px;
      background-color: rgb(250,250,250);
      display: flex;
      flex-direction: row;
      justify-content: space-between;
  }

  .navItem{
      width: auto;
      height: 100%;
      display: flex;
      justify-content: center;
      align-content: center;
  }

  #navTitle {
      margin-left: 18px;
      font-size: 18px;
      line-height: 44px;
  }

  .card {
    width: 48%;
    margin-right: 10px;
    margin-bottom: 10px;
    height: 180px;
    position: relative;
  }

  .runProj {
    position: absolute;
    right: 10px;
    top: 10px;
  }

  #cardContainer {
      padding: 10px;
  }
</style>
