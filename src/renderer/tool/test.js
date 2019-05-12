const p = {
    sayHello(){
        console.log("hello");
    },
    sayEat(){
        this.sayHello();
        console.log("eat");
    }
}

p.sayEat();