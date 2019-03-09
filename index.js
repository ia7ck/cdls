class MyArray extends Array {
  constructor(...elements) {
    super(...elements);
  }
  random_choice() {
    return this[MyArray.rand_int(0, this.length)];
  }
  static rand_int(lb, ub) {
    return Math.floor(Math.random() * (ub - lb)) + lb;
  }
}

const command_candidates = new MyArray({ first: "cd", second: "ls" }, { first: "mkdir", second: "cd" });
const type_command_map = { "cd": "ls", "mkdir": "cd" };

const CommandPair = {
  data() {
    return ({
      typed: "",
    });
  },
  props: {
    target: String,
    above_command: String,
  },
  created() {
    window.addEventListener("keydown", this.check);
  },
  methods: {
    check(ev) {
      if (ev.key === this.target[this.typed.length]) {
        this.typed = this.target.slice(0, this.typed.length + 1);
      } else {
        this.$emit("countup");
      }
      if (this.typed.length === this.target.length) {
        this.$emit("next");
        window.removeEventListener("keydown", this.check);
      }
    },
    show() {
      return this.typed.length > 0 && this.typed.length < this.target.length;
    },
  },
  computed: {
    chars() {
      return this.typed.split("");
    },
    suggestedChar() {
      return this.target[this.typed.length];
    },
  },
  template: `
    <div>
      <span>{{ '$ ' + above_command }}</span>
      <br>
      <span>{{ '$' }}</span>
      <span v-for="(ch, idx) in chars">{{ ch }}</span><span v-if="show()" style="color: lightgray;">{{ suggestedChar }}</span>
    </div>
  `
};

const Timer = {
  data() {
    return ({
      requestID: 0,
      elapse_time: 0,
    });
  },
  props: {
    start_time: Number,
    finished: Boolean,
  },
  mounted() {
    const callback = () => {
      if (!this._finished()) {
        this.update_elapse_time();
        window.requestAnimationFrame(callback);
      }
    };
    window.requestAnimationFrame(callback);
  },
  methods: {
    _finished() {
      return this.finished;
    },
    _requestID() {
      return this.requestID;
    },
    update_elapse_time() {
      this.elapse_time = performance.now() - this.start_time;
    },
  },
  computed: {
    format_time() {
      return (Math.floor(this.elapse_time / 100) / 10).toFixed(1);
    }
  },
  template: `<div>{{ format_time }}</div>`
};

const app = new Vue({
  el: "#app",
  components: {
    "command-pair": CommandPair,
    "timer": Timer,
  },
  data: {
    commands: [command_candidates.random_choice()],
    finished: false,
    start_time: 0,
    end_time: 0,
    typo_num: 0,
  },
  mounted() {
    this.start_time = performance.now();
  },
  methods: {
    next() {
      if (this.commands.length < 2) {
        this.commands.push(command_candidates.random_choice());
      } else {
        this.finished = true;
        this.end_time = performance.now();
      }
    },
    countup() {
      this.typo_num += 1;
    },
  },
  template: `
    <div>
      <div style="padding-bottom: .5rem;">
        <div>cd→ls, mkdir→cd</div>
        <timer v-show="!finished" :start_time="start_time" :finished="finished"></timer>
      </div>
      <command-pair class="wrap" v-for="(command, idx) in commands" :key="idx" :above_command="command.first" :target="command.second" @next="next" @countup="countup"></command-pair>
      <p v-show="finished">
        <span>Time: {{ ((end_time - start_time)/1000).toFixed(3) }} s</span>
        <br>
        <span>typo: {{ typo_num }}</span>
      </p>
    </div>
  `
});
