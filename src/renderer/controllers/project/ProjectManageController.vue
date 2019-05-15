<template>
  <div id="projectController" ref = "projectContainer">
      <Modal v-model="queryDeleteExist" title="请注意" @on-ok="onDeleteAllRecordsClick()">
            <p>确定清空保存的所有工程记录吗？</p>
            <p>这不会删除磁盘上的文件</p>
        </Modal>
      <div id = "rootContainer">
        <Drawer title="新建工程" v-model="showCreateForm" :width="formWidth" :styles="formStyles">
          <CreateForm></CreateForm>
        </Drawer> 
        <Drawer title="添加已有工程" v-model="showExistForm" :width="260">
            <AddExistForm></AddExistForm>
        </Drawer>
        <nav class = "navigationBar">
            <div class = "navItem">
                <div id = "navTitle">工程管理</div>
            </div>
            <div class = "navItem">
                <div class="menuItem">
                    <div class = "menuItemHover" @click = "onNewProjectClick()">
                        <Icon type="ios-add-circle-outline"  size = "24" />
                    </div>
                    <Dropdown>
                        <div class = "menuItemHover"><Icon type="ios-more" size = "24"/></div>
                        <DropdownMenu slot="list">
                            <DropdownItem ><div @click = "onAddExistClick()">添加已有工程</div></DropdownItem>
                            <DropdownItem><div @click = "onQueryDeleteExistClick()">清除所有工程</div></DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
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
  import AddExistForm from "@/controllers/project/AddExistForm";
  import AppDB from '../../tool/AppDB'
  import AppEventKeys from '../../tool/AppEventKeys'

  export default {
    name: 'engineclient',
    components:{
        'CreateForm' : CreateForm,
        'AddExistForm' : AddExistForm
    },
    created(){
        this.bus.$on(AppEventKeys.updateExistedProjects, ()=>{
            this.update();
        });
        this.bus.$on(AppEventKeys.hiddenForms, ()=>{
            this.hiddenForms();
        });
    },
    updated(){
        this.formWidth = this.$refs.projectContainer.clientWidth-1;
    },
    data(){
        const cards = AppDB.getRecentProjectsIndex();
        return {
            queryDeleteExist:false,
            showExistForm: false,
            showCreateForm: false,
            formWidth:400,
            formStyles: {
                height: 'calc(100% - 55px)',
                overflow: 'auto',
                paddingBottom: '53px',
                position: 'static'
            },
            cards
        }
    },
    methods:{
        update(){
            this.cards = AppDB.getRecentProjectsIndex();
        },
        hiddenForms(){
            this.showCreateForm = false;
            this.showExistForm = false;
        },
        onNewProjectClick(){
            this.showCreateForm = true;
        },
        onAddExistClick(){
            this.showExistForm = true;
        },
        onDeleteAllRecordsClick(){
            AppDB.removeAllRecentProjectsIndex();
            this.update();
        },
        onQueryDeleteExistClick(){
            this.queryDeleteExist = true;
        },
        onCardClick(item){
            const params = JSON.parse(JSON.stringify(item));
            this.$router.push({name:'edit', params});
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
      -webkit-app-region: drag;
  }

  .menuItem{
    display: flex;
    align-items: center;
    display: flex;
    flex-direction: row;
  }

  .menuItemHover{
      color:rgb(0,0,0);
      margin-right: 8px;
  }

  .menuItemHover:hover{ 
      color:#2d8cf0;
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
