<?php


$addon = rex_addon::get('project');

/* Addon Parameter */
if (rex::isBackend()) {
    rex_view::addJsFile($addon->getAssetsUrl('vue.js'));
    rex_view::addJsFile($addon->getAssetsUrl('main.js'));
}
