class ApiFeacture {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
            const keyword = this.queryStr && typeof this.queryStr.keyword === 'string' && this.queryStr.keyword.trim() ? {
                name: {
                    $regex: this.queryStr.keyword.trim(),
                    $options: "i",
                },
            } : {};
        
            // console.log('Search Keyword:', keyword); // For debugging
        
            // Only apply the keyword filter if it's not empty
            if (Object.keys(keyword).length > 0) {
                this.query = this.query.find({ ...keyword });
            }
        
            return this;   
    }

    filter(){
        const queryCopy = {...this.queryStr};


        //Removing some field for the category
        const removeFields  = ["keyword","page","limit"];
        removeFields.forEach((key) => delete queryCopy[key]);

        // Filter for the Price and Rating
        let queryStr = JSON.stringify(queryCopy);
      
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key)=>`$${key}`);
       
        this.query = this.query.find(JSON.parse(queryStr));


        return this;
    }

   
    

    pagination(resultPerPage){
        const currenctPage = Number(this.queryStr.page) || 1;

        const skip = resultPerPage *(currenctPage - 1);

        this.query = this.query.limit(resultPerPage).skip(skip);

        return this;
    }
}

module.exports = ApiFeacture;
