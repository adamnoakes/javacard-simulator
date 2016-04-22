/**
 * This code is from the original CAP.js file, used in the original simulator.
 *
 * This code is very messy and has only been modifed to remove 
 * JavaScript errors. The code requires a re-writing, however,
 * there was not enough time in the project to do this.
 */



/**
 * Mostly untouched
 */
function COMPONENT(inputData) {
    var Tag, AID, i, j, name, component_sizes, nj, applets, pointer, count, packages, constant_pool,
        signature_pool, arcount, type, interface_info, b, k;

    function AppletComponent() {
        var AID = [];
        this.AID_length = Data[pointer + 1];
        for (j = 0; j < this.AID_length; j++) { AID[j] = Data[pointer + 2 + j];}
        this.AID = AID;
        this.install_method_offset =
            (Data[pointer + this.AID_length + 2] << 8) + Data[pointer + this.AID_length + 3];
        pointer = pointer + this.AID_length + 3;
    }

    function ImportComponent() {
        this.minor_version = Data[1 + pointer];
        this.major_version = Data[2 + pointer];
        this.AID_length = Data[3 + pointer];
        AID = [];
        for (j = 0; j < this.AID_length; j++) {
            AID[j] = Data[4 + j + pointer];
        }
        this.AID = AID;
        pointer = pointer + this.AID_length + 3;
    }

    function ConstantPoolComponent() {
        this.tag = Data[pointer];
        this.info = [Data[pointer + 1], Data[pointer + 2], Data[pointer + 3]];
        pointer = pointer + 4;
    }

    function Interface(Data, pointer) {
        this.interface = (Data[pointer] << 8) + Data[pointer + 1];
        this.count = Data[pointer + 2];
        var index = [];
        if (this.count > 0) {
            for (var j = 0; j < this.count; j++) {
                index[j] = Data[pointer];
                pointer++;
            }
        }
        this.index = index;
    }

    function RemoteMethod(Data, pointer){
        this.remote_method_hash = Data[pointer].toString(16) + Data[pointer + 1].toString(16);
        this.signature_offset = (Data[pointer + 2] << 8) + Data[pointer + 3];
        this.virtual_method_token = Data[pointer + 4].toString(16);
    }

    function ExceptionHandler(Data, pointer){
        this.start_offset = (Data[pointer] << 8) + Data[1 + pointer];
        bitfield = (Data[pointer+2] << 8) + Data[3 + pointer];
        this.stop_bit = Data[pointer + 2] % 128;
        this.active_length = bitfield - 128 * this.stop_bit;
        this.handler_offset = (Data[pointer + 4] << 8) + Data[pointer+5];
        this.catch_type_index = (Data[pointer + 6] << 8) + Data[pointer + 7];
    }

    function ArrayInit(Data, pointer){
        this.type = Data[1 + pointer];
        this.count = (Data[pointer + 2] << 8) + Data[pointer + 3];

        var values = [];
        if (this.count > 0) {
            for (var j = 0; j < this.count; j++) { values[j] = Data[4 + pointer + j]; }
        }

        this.values = values;
    }

    function Field(Data, pointer){
        this.token = Data[pointer];
        this.access_flags = Data[pointer + 1].toString(16);
        this.field_ref = Data[pointer + 2].toString(16) + Data[pointer + 3].toString(16) + Data[pointer + 4].toString(16);
        this.type = Data[pointer + 5].toString(16) + Data[pointer + 6].toString(16);
        this.value = 0;
    }

    if (inputData.length > 0) {
        
        Tag = inputData[0];
        this.Tag = Tag;
        this.Size = (inputData[1] << 8) + inputData[2];
        Data = inputData.slice(3);
        switch (Tag) {
            case 1:
                //Header
                AID = [];
                this.magic = Data[0].toString(16) + Data[1].toString(16) + Data[2].toString(16) + Data[3].toString(16);
                this.minor_version = Data[4];
                
                this.major_version = Data[5];
                this.flags = Data[6];

                this.package_minorversion = Data[7];
                this.package_majorversion = Data[8];
                this.AID_length = Data[9];

                for (i = 0; i < this.AID_length; i++) {
                    AID[i] = Data[10+i];
                }

                this.AID = AID;

                if ((10 + this.AID_length) < Data.length) {
                    this.package_namelength = Data[10 + this.AID_length];
                    name = "";
                    for (i = 0; i < this.package_namelength; i++) { name = name + Data[11 + this.AID_length + i].toString(16); }
                    this.package_name = name;
                }

                break;
            case 2:

                //Directory
                component_sizes = [];
                nj = 11;
                for (j = 0; j < nj; j++) {
                    component_sizes[j] = (Data[2 * j] << 8) + Data[2 * j + 1];
                }
                nj = 2 * (nj + 1);
                this.component_sizes = component_sizes;
                this.sf_image_size = (Data[nj] << 8) + Data[nj + 1];
                this.sf_ainit_count = (Data[nj + 2] << 8) + Data[nj + 3];
                this.sf_ainit_size = (Data[nj + 4] << 8) + Data[nj + 5];
                this.import_count = Data[nj + 6];
                this.applet_count = Data[nj + 7];
                this.custom_count = Data[nj + 8];
                //custom components not supported
                break;
            case 3:

                //Applet
                this.count = parseInt(Data[0], 16);
                applets = [];
                pointer = 0;
                if (this.count > 0) {
                    for (i = 0; i < this.count; i++) {
                        applets[i] = new AppletComponent();
                    }
                    this.applets = applets;
                }
                break;
            case 4:
                //Import
                count = Data[0];
                this.count = count;
                packages = [];
                pointer = 0;
                for (i = 0; i < count; i++) {
                    packages[i] = new ImportComponent();
                }
                this.packages = packages;
                break;
            case 5:
                //ConstantPool

                this.count = (Data[0] << 8) + Data[1];
                constant_pool = [];
                pointer = 2;

                for (i = 0; i < this.count; i++) {

                    constant_pool[i] = new ConstantPoolComponent();
                }
                this.constant_pool = constant_pool;


                break;
            case 6:

                //Class
                /*function component(component, data){
                    component.data = data;
                    bitfield = data[0];
                    component.flags = (bitfield & 0xF0) >> 4;
                    component.isInterface = Boolean(flags & 0x8);
                    component.isShareable = Boolean(flags & 0x8);
                }*/

                pointer = 0;
                this.signature_pool_length = (Data[0] << 8) + Data[1];
                if (this.signature_pool_length >= 128) {
                    this.signature_pool_length = 0;
                } else {
                    pointer = 2;
                }
                signature_pool = [];


                if (this.signature_pool_length > 0) {
                    for (i = 0; i < this.signature_pool_length; i++) {
                        signature_pool[i] = {
                            nibble_count: Data[pointer],
                            arcount: Math.floor((this.nibble_count + 1) / 2),
                            type: ""

                        };
                        if (arcount > 0) {
                                Data.slice(pointer + 1, pointer + arcount + 1);
                            }
                            pointer += (arcount + 1);
                        }
                }

                this.signature_pool = signature_pool;
                interface_info = [];

                b = false;
                k = 0;

                while (!b) {
                    interface_info[k] = new function () {
                        this.start = pointer;
                        var flags = ((Data[pointer].toString(16)).slice(0, 1)).toString(2);
                        this.flag_interface = parseInt(flags.slice(0, 1), 2);
                        this.flag_shareable = parseInt(flags.slice(1, 2), 2);
                        this.flag_remote = parseInt(flags.slice(2, 3), 2);
                        this.interface_count = Data[pointer] & 0x0F; //parseInt(Data[pointer].toString(16).slice(1), 16);
                        pointer++;

                        if (this.flag_interface) {
                            var superinterfaces = [];
                            if (this.interface_count > 0) {
                                for (i = 0; i < this.interface_count; i++) {
                                    superinterfaces[i] = Data[pointer] + Data[pointer + 1];
                                    pointer += 2;
                                }
                            }
                            this.superinterfaces = superinterfaces;

                            if (this.flag_remote) {

                                this.interface_name_length = Data[pointer];
                                this.interface_name = Data.slice(pointer + 1, pointer + 1 + this.interface_name_length);

                            } else {
                                this.interface_name_length = 0;
                                this.interface_name = "";
                            }



                        } else {
                            this.super_class_ref1 = Data[pointer];
                            this.super_class_ref2 = Data[pointer + 1];
                            this.declared_instance_size = Data[pointer + 2];
                            this.first_reference_token = Data[pointer + 3].toString(16);
                            this.reference_count = Data[pointer + 4];
                            this.public_method_table_base = Data[pointer + 5];
                            this.public_method_table_count = Data[pointer + 6];
                            this.package_method_table_base = Data[pointer + 7];
                            this.package_method_table_count = Data[pointer + 8];
                            pointer += 9;

                            var public_virtual_method_table = [];
                            var package_virtual_method_table = [];

                            if (this.public_method_table_count > 0) {
                                for (i = 0; i < this.public_method_table_count; i++) {
                                    public_virtual_method_table[i] = (Data[pointer] << 8) + Data[pointer+1];
                                    pointer += 2;

                                }
                            }

                            if (this.package_method_table_count > 0) {
                                for (i = 0; i < this.package_method_table_count; i++) {
                                    package_virtual_method_table[i] = (Data[pointer] << 8) + Data[pointer + 1];
                                    pointer += 2;

                                }
                            }

                            this.public_virtual_method_table = public_virtual_method_table;
                            this.package_virtual_method_table = package_virtual_method_table;
                            
                            var interfaces = [];
                            if (this.interface_count > 0) {
                                for (i = 0; i < this.interface_count; i++) {

                                    interfaces[i] = new Interface(Data, pointer);

                                }
                            }
                            this.interfaces = interfaces;

                            var remote_interfaces = function () {

                                if (this.flag_remote) {
                                    this.remote_methods_count = Data[pointer];
                                    var remote_methods = [];
                                    pointer++;
                                    if (this.count > 0) {
                                        for (i = 0; i < this.remote_methods_count; i++) {
                                            remote_methods[i] = new RemoteMethod(Data, pointer);
                                            pointer += 5;
                                        }
                                    }

                                    this.remote_methods = remote_methods;
                                    this.hash_modifier_length = Data[pointer];
                                    this.hash_modifier = Data.slice(pointer + 1, pointer + this.hash_modifier_length + 1);
                                    pointer += this.hash_modifier_length + 1;
                                    this.class_name_length = Data[pointer];
                                    this.class_name = Data.slice(pointer + 1, pointer + this.class_name_length + 1);
                                    pointer += this.class_name_length + 1;

                                    var r_interfaces = [];
                                    this.remote_interfaces_count = Data[pointer];
                                    for (i = 0; i < this.remote_interfaces_count; i++) {
                                        r_interfaces[i] = Data[pointer + 1].toString(16) + Data[pointer + 2].toString(16);
                                        pointer += 2;
                                    }
                                    this.r_interfaces = r_interfaces;
                                }
                            };
                            this.remote_interfaces = new remote_interfaces();

                        }

                        if (pointer >= Data.length) { b = true; }

                    };
                    k++;
                }
                this.interface_info = interface_info;
                this.i_count = k;


                break;
            case 7:
                //Method
                var hc = Data[0];
                this.handler_count = hc;

                var exception_handlers = [];
                var method_info = [];
                pointer = 1;
                b = false;

                
                this.method_info = Data.slice(pointer);
                var bitfield;

                for (i = 0; i < hc; i++) {
                    exception_handlers[i] = new ExceptionHandler(Data, pointer);
                    pointer = pointer + 8;
                }
                
                this.exception_handlers = exception_handlers;

                
                
                break;
            case 8:
                //Static Field
                var array_init = [];
                this.image_size = (Data[0] << 8) + Data[1];
                this.reference_count = (Data[2] << 8) + Data[3];
                this.array_init_count = (Data[4] << 8) + Data[5];
                pointer = 5;

                if (this.array_init_count > 0) {

                    for (i = 0; i < this.array_init_count; i++) {
                        array_init[i] = new ArrayInit(Data, pointer);
                        pointer = pointer + 3 + array_int[i].count;

                    }
                }
                this.array_init = array_init;
                this.default_value_count = (Data[1 + pointer] << 8) + Data[2 + pointer];
                this.non_default_value_count = (Data[3 + pointer] << 8) + Data[4 + pointer];
                var non_default_values = [];
                if (this.non_default_value_count > 0) {
                    for (j = 0; j < this.non_default_value_count; j++) { non_default_values[j] = Data[5 + pointer + j]; }
                }
                this.non_default_values = non_default_values;

                break;
            case 9:
                //ReferenceLocation
                this.byte_index_count = (Data[0] << 8) + Data[1];
                var offsets_to_byte_indices = [];
                var offsets_to_byte2_indices = [];
                pointer = 2;
                if (this.byte_index_count > 0) {
                    for (j = 0; j < this.byte_index_count; j++) { offsets_to_byte_indices[j] = Data[pointer + j]; }
                }
                this.offsets_to_byte_indices = offsets_to_byte_indices;

                pointer = pointer + this.byte_index_count;
                this.byte2_index_count = (Data[pointer] << 8) + Data[pointer + 1];
                if (this.byte2_index_count > 0) {
                    for (j = 0; j < this.byte2_index_count; j++) { offsets_to_byte2_indices[j] = Data[pointer + j + 2]; }
                }
                this.offsets_to_byte2_indices = offsets_to_byte2_indices;

                break;
            case 10:
                //Export
                var class_exports = [];
                pointer = 1;
                this.class_count = Data[0];
                for (i = 0; i < this.class_count; i++) {
                    var static_field_offsets = [];
                    var static_method_offsets = [];
                    class_exports[i].class_offset = (Data[pointer] << 8) + Data[pointer+1];
                    class_exports[i].static_field_count = Data[2 + pointer];
                    class_exports[i].static_method_count = Data[3 + pointer];
                    pointer = pointer + 4;
                    if (class_exports[i].static_field_count > 0) {
                        for (j = 0; j < class_exports[i].static_field_count; j++) { static_field_offsets[j] = Data[pointer + j]; }
                        pointer = pointer + class_exports[i].static_field_count;
                    }
                    if (class_exports[i].static_method_count > 0) {
                        for (j = 0; j < class_exports[i].static_method_count; j++) { static_method_offsets[j] = Data[pointer + j]; }
                        pointer = pointer + static_method_count;
                    }

                    class_exports[i].static_field_offsets = static_field_offsets;
                    class_exports[i].static_method_offsets = static_method_offsets;
                }
                this.class_exports = class_exports;
                break;
            case 11:
                //Descriptor

                var classes = [];
                pointer = 1;
                var static_fields = [];
                this.class_count = Data[0];
                if (this.class_count > 0) {
                    for (i = 0; i < this.class_count; i++) {
                            classes[i].token = Data[pointer];
                            classes[i].access_flags = Data[pointer + 1];
                            classes[i].this_class_ref = Data[pointer + 2].toString(16) + Data[pointer + 3].toString(16);
                            classes[i].interface_count = Data[pointer + 4];
                            classes[i].field_count = (Data[pointer+5] << 8) + Data[pointer+6];
                            classes[i].method_count = (Data[pointer+7] << 8) + Data[pointer+8];
                            pointer += 9;

                            var interfaces = [];
                            var fields = [];
                            var methods = [];
                            if (classes[i].interface_count > 0) {
                                for (j = 0; j < classes[i].interface_count; j++) {
                                    interfaces[j] = (Data[pointer]<< 8) + Data[pointer + 1];
                                    pointer += 2;
                                }

                            }

                            if (classes[i].field_count > 0) {
                                for (j = 0; j < classes[i].field_count; j++) {
                                    fields[j] = new Field(Data, pointer);
                                    pointer += 7;
                                    if (parseInt(fields[j].access_flags.slice(1), 16) >= 8) {
                                        static_fields[static_fields.length] = fields[j];
                                    }
                                }

                            }

                            if (classes[i].method_count > 0) {
                                for (j = 0; j < classes[i].method_count; j++) {
                                    
                                        methods[j].token = Data[pointer];
                                        methods[j].access_flags = Data[pointer + 1];
                                        methods[j].method_offset = (Data[pointer + 2] << 8)+ Data[pointer + 3];
                                        methods[j].type_offset = (Data[pointer + 4] << 8) + Data[pointer + 5];
                                        methods[j].bytecode_count = (Data[pointer + 6] << 8) + Data[pointer + 7];
                                        methods[j].exception_handler_count = (Data[pointer + 8] << 8)+ Data[pointer + 9];
                                        methods[j].exception_handler_index = (Data[pointer + 10] << 8)+ Data[pointer + 11];
                                        
                                    
                                    pointer += 12;
                                }
                            }
                            classes[i].interfaces = interfaces;
                            classes[i].fields = fields;
                            this.methods = methods;
                        
                    }
                }
                this.classes = classes;
                this.static_fields = static_fields;
                var t;
                var start = pointer;
                var constant_pool_types = [];
                var type_desc = [];
                t.constant_pool_count = (Data[pointer] << 8)+ Data[pointer + 1];
                pointer = pointer + 2;
                if (t.constant_pool_count > 0) {
                    for (j = 0; j < t.constant_pool_count; j++) {
                        constant_pool_types[j] = Data[pointer].toString(16) + Data[pointer+1].toString(16);
                        pointer += 2;
                    }
                }
                t.constant_pool_types = constant_pool_types;
                k = 0;
                while (pointer <= Data.length) {
                        type = [];
                        type_desc[k].nibble_count = Data[pointer];
                        type_desc[k].start = pointer - start;
                        pointer++;
                        if (Math.floor((type_desc[k].nibble_count + 1) / 2) > 0) {
                            for (j = 0; j < Math.floor((type_desc[k].nibble_count + 1) / 2) ; j++) {
                                type[j] = Data[pointer];
                                pointer++;
                            }
                        }
                        type_desc[k].type = type;
                    
                    k++;
                }
                t.type_count = k + 1;
                t.type_desc = type_desc;

                this.types = t;




                break;
            case 12:
                //Debug

                //this.string_count = parseInt(Data[0] + Data[1], 16);
                //var pointer = 2;
                //var strings_table = [];
                //if (this.string_count > 0) {
                //    for (var i = 0; i < this.string_count; i++) {
                //        strings_table[i] = new function () {
                //            this.length = parseInt(Data[pointer] + Data[pointer + 1], 16);
                //            this.bytes = Data.slice(pointer + 2, pointer + 2 + this.length);
                //            pointer += 2 + this.length;
                //        }
                //    }
                //}
                //this.package_name_index = parseInt(Data[pointer] + Data[pointer + 1], 16);
                //this.class_count = parseInt(Data[pointer + 2] + Data[pointer + 3], 16);
                //pointer += 4;
                //var classes = [];
                //if (this.class_count > 0) {
                //    for (var i = 0; i < this.class_count; i++) {
                //        classes[i] = new function () {
                //            this.name_index = parseInt(Data[pointer] + Data[pointer + 1], 16);
                //            this.access_flags = Data[pointer + 2] + Data[pointer + 3];
                //            var bit2 = parseInt(this.access_flags.slice(1, 2), 16);

                //            if (bit2 == 8) { this.flag_shareable = true; this.flag_abstract = false; this.flag_interface = false; }
                //            if (bit2 == 4) { this.flag_shareable = false; this.flag_abstract = true; this.flag_interface = false; }
                //            if (bit2 == 2) { this.flag_shareable = false; this.flag_abstract = false; this.flag_interface = true; }
                //            if (bit2 == 0) { this.flag_shareable = false; this.flag_abstract = false; this.flag_interface = false; }

                //            bit2 = parseInt(this.access_flags.slice(2, 3), 16);
                //            if (bit2 == 2) { this.flag_remote = true; this.flag_final = false; }
                //            if (bit2 == 1) { this.flag_remote = false; this.flag_final = true; }
                //            if (bit2 == 0) { this.flag_remote = false; this.flag_final = false; }

                //            if (parseInt(this.access_flags.slice(3), 16) = 1) { this.flag_public = true; }
                //            else { this.flag_public = false; }

                //            this.location = parseInt(Data[pointer + 4] + Data[pointer + 5], 16);
                //            this.superclass_name_index = parseInt(Data[pointer + 6] + Data[pointer + 7], 16);
                //            this.source_file_index = parseInt(Data[pointer + 8] + Data[pointer + 9], 16);
                //            this.interface_count = parseInt(Data[pointer + 10], 16);
                //            this.field_count = parseInt(Data[pointer + 11] + Data[pointer + 12], 16);
                //            this.method_count = parseInt(Data[pointer + 13] + Data[pointer + 14], 16);
                //            pointer += 15;
                //            var interface_names_indexes = [];
                //            if (this.interface_count > 0) {
                //                for (var j = 0; j < this.interface_count; j++) {
                //                    interface_names_indexes[j] = parseInt(Data[pointer] + Data[pointer + 1], 16);
                //                    pointer += 2;
                //                }
                //            }
                //            this.interface_names_indexes = interface_names_indexes;

                //            var fields = [];
                //            var methods = [];
                //            if (this.field_count > 0) {
                //                for (var j = 0; j < this.field_count; j++) {
                //                    fields[j] = new function () {
                //                        this.name_index = parseInt(Data[pointer] + Data[pointer + 1], 16);
                //                        this.descriptor_index = parseInt(Data[pointer + 2] + Data[pointer + 3], 16);
                //                        this.access_flags = Data[pointer + 4] + Data[pointer + 5];
                //                        this.const_value = Data[pointer + 6] + Data[pointer + 7] + Data[pointer + 8] + Data[pointer + 9];
                //                        pointer += 10;
                //                    }
                //                }
                //            }
                //            this.fields = fields;

                //            if (this.method_count > 0) {
                //                for (var j = 0; j < this.method_count; j++) {
                //                    methods[j] = new function () {
                //                        this.name_index = parseInt(Data[pointer] + Data[pointer + 1], 16);
                //                        this.descriptor_index = parseInt(Data[pointer + 2] + Data[pointer + 3], 16);
                //                        this.access_flags = Data[pointer + 4] + Data[pointer + 5];
                //                        this.location = parseInt(Data[pointer + 6] + Data[pointer + 7], 16);
                //                        this.header_size = parseInt(Data[pointer + 8], 16);
                //                        this.body_size = parseInt(Data[pointer + 9] + Data[pointer + 10], 16);
                //                        this.variable_count = parseInt(Data[pointer + 11] + Data[pointer + 12], 16);
                //                        this.line_count = parseInt(Data[pointer + 13] + Data[pointer + 14], 16);
                //                        pointer += 15;
                //                        var variable_info = [];
                //                        if (this.variable_count > 0) {
                //                            for (var k = 0; k < this.variable_count; k++) {
                //                                variable_info[k] = new function () {
                //                                    this.index = parseInt(Data[pointer], 16);
                //                                    this.name_index = parseInt(Data[pointer + 1] + Data[pointer + 2], 16);
                //                                    this.descriptor_index = parseInt(Data[pointer + 3] + Data[pointer + 4], 16);
                //                                    this.start_pc = parseInt(Data[pointer + 5] + Data[pointer + 6], 16);
                //                                    this.length = parseInt(Data[pointer + 7] + Data[pointer + 8], 16);
                //                                    pointer += 9;
                //                                }
                //                            }
                //                        }
                //                        this.variable_info = variable_info;

                //                        var line_info = [];
                //                        if (this.line_count > 0) {
                //                            for (var k = 0; k < this.line_count; k++) {
                //                                line_info[k] = new function () {
                //                                    this.start_pc = parseInt(Data[pointer] + Data[pointer + 1], 16);
                //                                    this.end_pc = parseInt(Data[pointer + 2] + Data[pointer + 3], 16);
                //                                    this.source_line = parseInt(Data[pointer + 4] + Data[pointer + 5], 16);
                //                                    pointer += 6;
                //                                }
                //                            }
                //                        }
                //                        this.line_info = line_info;
                //                    }
                //                }
                //            }
                //            this.methods = methods;
                 //       }
                 //   }
                //}
                break;
            default:
        }
        
    }
}

exports.COMPONENT = COMPONENT;