<template>
  <v-treeview
    v-model="tree"
    :items="items"
    activatable
    item-key="name"
    open-on-click
  >
    <template v-slot:prepend="{ item, open }">
      <v-icon v-if="!item.file">
        {{ open ? "mdi-folder-open" : "mdi-folder" }}
      </v-icon>
      <v-icon v-else>
        {{ files[item.file] }}
      </v-icon>
    </template>
  </v-treeview>
</template>

<script>
export default {
  data() {
    return {
      items: [
        {
          name: ".git",
        },
        {
          name: "node_modules",
        },
        {
          name: "public",
          children: [
            {
              name: "static",
              children: [
                {
                  name: "logo.png",
                  file: "png",
                },
              ],
            },
            {
              name: "favicon.ico",
              file: "png",
            },
            {
              name: "index.html",
              file: "html",
            },
          ],
        },
        {
          name: ".gitignore",
          file: "txt",
        },
      ],
    };
  },
};
</script>

<style>
</style>