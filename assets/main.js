Vue.component('innerblocks', {
    props: ['value'],
    data: function () {
      return {
        editing: 0,
        add_block_type: null,
        blocks: [],
        block_types: [
          {
            key: 'paragraph',
            title: 'Absatz',
          },
          {
            key: 'heading',
            title: 'Heading',
          },
        ]
      }
    },
    methods: {
      addBlock: function(evt){
        evt.preventDefault();
        console.log(this.add_block_type);
        this.blocks.push({
          key: this.add_block_type,
          html: '',
          data: {},
        });
        

      },
      deleteBlock(block) {
        let new_blocks = this.blocks.filter(function(item){
          return item != block;
        })
        this.blocks = new_blocks;

      },
      moveUp: function(block) {
        let idx = this.blocks.indexOf(block)
        console.log(idx)
        if (0 < idx) {
          let new_blocks = Array(this.blocks);
          let switch_block = this.blocks[idx-1]
          new_blocks[idx-1] = block;
          new_blocks[idx]   = switch_block;
          this.blocks = new_blocks;
          this.saveContent()
        }

      },
      moveDown: function(block) {
        let idx = this.blocks.indexOf(block)
        if (idx < this.blocks.length - 1) {
          let new_blocks = Array(this.blocks);
          let switch_block = this.blocks[idx+1]
          new_blocks[idx+1] = block;
          new_blocks[idx]   = switch_block;
          this.blocks = new_blocks;
          this.saveContent()
        }

      },
      setEditing(block) {
        this.editing = block;
      },
      // Parse HTML Content for inner blocks
      // Todo: kann noch falsch sein bei mehrfacher Verschachtelung von 
      // innerblocks
      parseValue(){
        let regex_start = RegExp("<!-- rex:([a-zA-Z0-9_-]+) .*-->")
        let regex_params = RegExp("{.*}")
        let blocks = [];
        let max_tries = 100;
        let match = null;
        let row = 0;
        let content = this.value.html;
        match = content.match(regex_start);
        while (100 > row && match) {
            row++;
            let key = match[1];
            let params = {}
            let match_params = match[0].match(regex_params)
            if (match_params)   {
                params = JSON.parse(match_params)
            }
            let end_str = '<!-- /rex:' + key+' -->';
            content = content.replace(match[0], "");     
            var idx = content.indexOf(end_str);
            let html = content.substr(0, idx);
            blocks.push({
                key: key,
                html: html,
                data: params,
            })
            content = content.substring(idx+end_str.length);
            match = content.match(regex_start);
        }
        this.blocks = blocks;
      },
      saveBlock(data){
        let that = this;
        let new_blocks = [];
        for (var i=0; i < this.blocks.length; i++) {
            if (this.blocks[i] == that.editing) {
                let new_block = Object.assign({}, this.blocks[i]);
                new_block.html =  data.html
                new_block.data = data.data
                new_blocks.push(new_block)
            } else {
                new_blocks.push(this.blocks[i])
            }
        }
        this.blocks = new_blocks;
        this.editing = 0;
        this.saveContent();
      },
      saveContent() {
          let content = "";
          this.blocks.forEach(function(block){
              content+= "<!-- rex:"+block.key+" ";
              if  (0 < Object.keys(block.data)) {
                  content+= JSON.stringify(block.data) +" "
              }
              content+= "-->\n";
              content+= block.html.trim();
              content+= "\n<!-- /rex:"+block.key+" -->\n";
          })
          this.$emit('input', {
            html: content,
            data: {}
          });
      }
    },
    created: function(){
        this.parseValue();
    },
    template: `<div>
                  <div v-for="block in blocks">
                    <div v-if="block == editing" 
                        :is="block.key" 
                        v-bind:value="block"
                        @input="saveBlock"
                        ></div>
                    <div v-if="block != editing" v-html="block.html"></div>
                    <button type="button" @click="setEditing(block)">Edit</button>
                    <button type="button" @click="deleteBlock(block)">Delete</button>
                    <button type="button" @click="moveUp(block)">Up</button>
                    <button type="button" @click="moveDown(block)">Down</button>
                  </div>
                  <div>
                    <select v-model="add_block_type">
                      <option v-for="block_type in block_types"
                        :value="block_type.key"
                        v-html="block_type.title"></option>
                    </select>
                    <button type="button" @click="addBlock">Add</button>
                  </div>
                </div>`,
})

Vue.component('paragraph', {
    props: ['value'],
    data: function () {
      return {
        content: '',
      }
    },
    methods: {
        save: function(){
            let val = {
                html: '<p>'+this.content+'</p>',
                data: {}
            }
            this.$emit('input', val );
        }
    },
    created: function(){
        this.content = $(this.value.html).html();
    },
    template: '<input type="text" v-model="content" @blur="save">'
  })

Vue.component('heading', {
  props: ['value'],
  data: function () {
    return {
      content: '',
      tag: 'h1',
    }
  },
  methods: {
      save: function(){
          let val = {
              html: "<" + this.tag +">" 
                + this.content + 
                "</" + this.tag +">",
              data: {}
          }
          this.$emit('input', val );
      }
  },
  created: function(){
      this.content = $(this.value.html).html();
  },
  template: '<input type="text" v-model="content" @blur="save">'
})

function startVueEditor(){
    let html = $("#vueeditor_content").val().trim();
    let mod = new Vue({
        el: "#vueeditor",
        data: {
          html: html,
        },  
        methods: {
          saveBlock: function(params){
            $("#vueeditor_content").val(params.html)
          }
        },
        template: `<div>
            <innerblocks 
              :value="{html: html, params: {}}"
              @input="saveBlock"
            ></innerblocks>
          </div>`,
    })
}