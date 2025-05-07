package com.nfcreader;

import com.github.devnied.emvnfccard.iso7816emv.TagAndLength;
import com.github.devnied.emvnfccard.utils.TlvUtil;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class DOL {

    public enum Type{
        PDOL("Processing Options Data Object List"),
        CDOL1("Card Risk Management Data Object List 1"),
        CDOL2("Card Risk Management Data Object List 2"),
        TDOL("Transaction Certificate Data Object List"),
        DDOL("Dynamic Data Authentication Data Object List");

        private String description;

        private Type(String description){
            this.description = description;
        }

        public String getDescription(){
            return description;
        }

        @Override
        public String toString(){
            return getDescription();
        }
    }

    private Type type;
    private List<TagAndLength> tagAndLengthList = new ArrayList<TagAndLength>();

    public DOL(Type type, byte[] data){
        //Parse tags and lengths
        this.type = type;
        this.tagAndLengthList = TlvUtil.parseTagAndLength(data);
    }

    public List<TagAndLength> getTagAndLengthList(){
        return Collections.unmodifiableList(tagAndLengthList);
    }

    @Override
    public String toString(){
        StringWriter sw = new StringWriter();
        dump(new PrintWriter(sw), 0);
        return sw.toString();
    }


    public void dump(PrintWriter pw, int indent){
        pw.println(getSpaces(indent)+type.getDescription());
        final int INDENT_SIZE = 2;
        String indentStr = getSpaces(indent+INDENT_SIZE);

        for(TagAndLength tagAndLength : tagAndLengthList){
            int length = tagAndLength.getLength();
            pw.println(indentStr+tagAndLength.getTag().getName() + " ("+length+ " "+(length==1?"byte":"bytes")+")");
        }
    }

    public static String getSpaces(int length) {
        StringBuilder buf = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            buf.append(" ");
        }
        return buf.toString();
    }
} 