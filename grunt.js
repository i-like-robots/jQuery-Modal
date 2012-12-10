module.exports = function(grunt) {

  grunt.initConfig({
    min: {
      dist: {
        src: ['js/modal.js'],
        dest: 'js/modal.min.js'
      }
    },
    lint: {
      files: ['grunt.js', 'js/modal.js']
    },
    jshint: {
      options: {
        trailing: true,
        browser: true
      },
      globals: {
        jQuery: true
      }
    }
  });

  grunt.registerTask('default', 'lint min');

};