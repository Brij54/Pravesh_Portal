package com.rasp.app.resource;

import java.util.List;

public class WrapperClass {
    private List<MetaDataDto> resourceDtos; // Required
    private List<EnumDto> enumDtos;
    private String dbName;

    public String getDbName() {
        return dbName;
    }

    public void setDbName(String dbName) {
        this.dbName = dbName;
    }
    public List<MetaDataDto> getResourceDtos() {
        return resourceDtos;
    }

    public void setResourceDtos(List<MetaDataDto> rsourceDtos) {
        this.resourceDtos = rsourceDtos;
    }

    public List<EnumDto> getEnumDtos() {
        return enumDtos;
    }

    public void setEnumDtos(List<EnumDto> enumDtos) {
        this.enumDtos = enumDtos;
    }
}
