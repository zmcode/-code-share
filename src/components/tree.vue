<template>
  <v-dialog
    max-width="500"
    v-bind="$attrs"
    content-class="treeDialog"
    @click:outside="handleClose"
  >
    <v-treeview
      activatable
      :items="treeData"
      @update:active="updateActive"
      :active="$attrs.active"
    ></v-treeview>
    <v-card-actions style="padding-bottom: 20px">
      <v-btn class="save-btn" color="primary" block @click="confirm"
        >确定</v-btn
      >
    </v-card-actions>
  </v-dialog>
</template>

<script>
export default {

  data() {
    return {
      treeData: [],
      active: "",
    };
  },
  mounted() {
    this.$http.getCategory().then((res) => {
      if (res.data && res.data.length) {
        res.data.unshift({
          id: '',
          name: "全部",
        });
        this.treeData = res.data;
      }
    });
  },
  methods: {
    handleClose() {
      this.$emit("update:value", false);
    },
    updateActive(value) {
      this.active = value;
    },
    confirm() {
      console.log(this.active, 'this.active')
      this.$emit("getValue", this.active[0]);
      this.$emit("update:value", false);
    },
  },
};
</script>

<style scoped lang="scss">
.v-dialog__content {
  ::v-deep .treeDialog {
    background: #333;
  }
}
</style>