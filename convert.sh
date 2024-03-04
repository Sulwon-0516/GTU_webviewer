#!/bin/bash
MODE=$1



# We convert .ply into 

if [ $MODE == "0" ]; then
    # Load directly from human dir
    DST_PATH="/home/inhee/VCL/visualizer/GTU_webviewer/demo/assets/zju377/zju377"
    PLY_PATH="/home/inhee/VCL/repos_2024/gtu/output/240204_zju_377/240205_only_rgb_w_lpips_reg_v2/humans/000/point_cloud/iteration_12000/point_cloud.ply"

    # {input_file} {output_file}
    node util/create-ksplat.js ${PLY_PATH} ${DST_PATH}_high.ksplat 0 1 5.0 256 1
    node util/create-ksplat.js ${PLY_PATH} ${DST_PATH}.ksplat 1 1 5.0 256 1
    
elif [ $MODE == "1" ]; then
    # Load directly from human dir
    mkdir -p /home/inhee/VCL/visualizer/GTU_webviewer/demo/assets/zju377_ours
    DST_PATH="/home/inhee/VCL/visualizer/GTU_webviewer/demo/assets/zju377_ours/zju377"
    PLY_PATH="/home/inhee/VCL/repos_2024/gtu/output/240204_zju_377/0204_defacto_new_ti_raw_cnv2_rbg05_v2/web_viewer/person_000.ply"
    JSN_PATH="/home/inhee/VCL/repos_2024/gtu/output/240204_zju_377/0204_defacto_new_ti_raw_cnv2_rbg05_v2/web_viewer/person_000.json"
    
    # copy json file
    cp ${JSN_PATH} ${DST_PATH}_tfs.json

    # {input_file} {output_file}
    node util/create-ksplat.js ${PLY_PATH} ${DST_PATH}_high.ksplat 0 1 5.0 256 1
    node util/create-ksplat.js ${PLY_PATH} ${DST_PATH}.ksplat 1 1 5.0 256 1
fi